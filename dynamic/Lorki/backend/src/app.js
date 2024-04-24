require("dotenv").config();
const http = require("http");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io");
const { handleError } = require("./middlewares/handleError");
const ApiError = require("./utils/apiError");
const { getKey } = require("./utils");
const ProjectService = require("./services/project.service");
const app = express();

// apply middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// initiate database
require("./dbs/mongodb.init");

// initiate router
app.use("/v1/api", require("./routes"));

// handle error
app.use((req, res, next) => {
  next(
    new ApiError(404, [
      {
        msg: "Not Found",
      },
    ])
  );
});
app.use(handleError);

const server = http.createServer(app);

//  Handle SocketIO
const io = new Server(server, {
  cors: "http://localhost:3000",
});
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(socket.id + " has connected");
  // global.chatSocket = socket;
  socket.on("addUser", async (userId) => {
    onlineUsers.set(userId, socket.id);
    try {
      const { projects } = await ProjectService.getAll(userId);
      projects.forEach((project) => {
        socket.join(`project:${project._id}`);
      });
    } catch (error) {
      console.log(error);
    }
    io.emit("getUsers", Array.from(onlineUsers));
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverUserSocket = onlineUsers.get(receiverId);
    if (receiverUserSocket) {
      socket.to(receiverUserSocket).emit("getMessage", {
        senderId,
        message,
        createdAt: new Date(),
      });
    }
  });

  socket.on("createProject", ({ project, oldAndNewMembers }) => {
    socket.join(`project:${project._id}`);
    project.action = "add";
    oldAndNewMembers.forEach((member) => {
      const memberSocket = onlineUsers.get(member);
      if (memberSocket) socket.to(memberSocket).emit("getProject", project);
    });
  });

  socket.on("handleProject", ({ project, action }) => {
    project.action = action;
    socket.broadcast.to(`project:${project._id}`).emit("getProject", project);
  });

  socket.on("handleSection", ({ section, action }) => {
    socket.broadcast
      .to(`project:${section.project}`)
      .emit("getSection", { section, action });
  });

  socket.on("handleTask", ({ task, action }) => {
    socket.broadcast
      .to(`project:${task.project}`)
      .emit("getTask", { task, action });
  });

  socket.on("handleSubTask", ({ subTask, action }) => {
    socket.broadcast
      .to(`project:${subTask.project}`)
      .emit("getSubTask", { subTask, action });
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " has disconnected");
    onlineUsers.delete(getKey(onlineUsers, socket.id));
    io.emit("getUsers", Array.from(onlineUsers));
  });
});

module.exports = server;
