const SectionService = require("../services/section.service");
const { Types } = require("mongoose");

class SectionController {
  static async create(req, res) {
    const data = await SectionService.create(
      req.user.userId,
      req.params.projectId,
      req.body.title
    );

    res.status(200).json({ data });
  }

  static async update(req, res) {
    const data = await SectionService.update(
      req.params.projectId,
      req.params.sectionId,
      req.body
    );
    res.status(200).json({ data });
  }

  static async delete(req, res) {
    await SectionService.delete(req.params.projectId, req.params.sectionId);
    res.status(200).json({ msg: "Section is deleted!" });
  }
}

module.exports = SectionController;
