const SubTaskService = require("../services/subtask.service");

class SubTaskController {
  static async getAll(req, res) {
    const data = await SubTaskService.getAll(req.params.taskId);
    res.json({ data });
  }
  static async create(req, res) {
    const data = await SubTaskService.create(req.body);
    res.status(201).json({ data });
  }

  static async update(req, res) {
    const data = await SubTaskService.update(req.params.subtaskId, req.body);
    res.json({ data });
  }

  static async delete(req, res) {
    await SubTaskService.delete(req.params.subtaskId);
    res.json({ msg: "Subtask deleted" });
  }
}

module.exports = SubTaskController;
