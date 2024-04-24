const SubTask = require("../models/subtask.model");

class SubTaskService {
  static async getAll(taskId) {
    const subTasks = await SubTask.find({ task: taskId });
    return { subTasks };
  }
  static async create({ task, title }) {
    const subTask = await SubTask.create({ task, title });

    return { subTask };
  }

  static async update(subTaskId, newData) {
    const subTask = await SubTask.findByIdAndUpdate(
      subTaskId,
      {
        $set: newData,
      },
      { new: true }
    );
    return { subTask };
  }

  static async delete(subTaskId) {
    await SubTask.findByIdAndDelete(subTaskId);
  }
}

module.exports = SubTaskService;
