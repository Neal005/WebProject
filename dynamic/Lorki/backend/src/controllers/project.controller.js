const ProjectService = require("../services/project.service");

class ProjectController {
  static async create(req, res) {
    const data = await ProjectService.create({
      ...req.body,
      owner: req.user.userId,
    });
    return res.status(201).json({ data });
  }

  static async getAll(req, res) {
    const data = await ProjectService.getAll(req.user.userId);
    res.status(200).json({ data });
  }

  static async getOne(req, res) {
    const data = await ProjectService.getOne(
      req.user.userId,
      req.params.projectId
    );

    res.status(200).json({ data });
  }
  static async getPinnedProjects(req, res) {
    const data = await ProjectService.getPinnedProjects(req.user.userId);

    res.status(200).json({ data });
  }
  static async update(req, res) {
    const data = await ProjectService.update(req.params.projectId, req.body);
    res.status(200).json({ data });
  }
  static async delete(req, res) {
    await ProjectService.delete(req.params.projectId);
    res.status(200).json({ msg: "Deleted" });
  }
}

module.exports = ProjectController;
