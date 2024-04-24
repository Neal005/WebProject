const TaskService = require("../services/task.service");

class TaskController {
  static async create(req, res) {
    const data = await TaskService.create({
      ...req.body,
      assignees: [req.user.userId],
    });

    res.status(201).json({ data });
  }

  static async update(req, res) {
    const data = await TaskService.update(req.params.taskId, req.body);

    res.status(200).json({ data });
  }

  static async delete(req, res) {
    await TaskService.delete(req.params.taskId);
    res.status(200).json({ msg: "Task is deleted" });
  }

  static async updatePosition(req, res) {
    await TaskService.updatePosition(req.body);
    res.json({ msg: "Updated" });
  }
}

module.exports = TaskController;
