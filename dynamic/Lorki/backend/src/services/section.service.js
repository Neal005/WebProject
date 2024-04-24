const { Project, Section, Task, SubTask } = require("../models");
const ApiError = require("../utils/apiError");

class SectionService {
  static async create(userId, projectId, title) {
    let project = await Project.findOne({
      _id: projectId,
      owner: userId,
    }).lean();
    console.log({ project });
    if (!project) {
      project = await Project.findOne({
        _id: projectId,
        members: userId,
      }).lean();

      if (!project)
        throw new ApiError(400, { errors: [{ msg: "Project not found" }] });
    }
    const section = await Section.create({
      project: projectId,
      title,
    });

    section._doc.tasks = [];
    return { section };
  }

  static async update(projectId, sectionId, newSectionInfo) {
    let section = await Section.findOne({
      _id: sectionId,
      project: projectId,
    }).lean();

    if (!section)
      throw new ApiError(400, { errors: [{ msg: "Section not found" }] });

    section = await Section.findByIdAndUpdate(
      sectionId,
      {
        $set: newSectionInfo,
      },
      { new: true }
    );

    section._doc.tasks = [];
    console.log({ section });
    return { section };
  }

  static async delete(projectId, sectionId) {
    const section = await Section.findOne({
      _id: sectionId,
      project: projectId,
    }).lean();
    if (!section)
      throw new ApiError(400, { errors: [{ msg: "Section not found" }] });

    const tasksOfSection = await Task.find({ section: sectionId }).lean();
    for (let task in tasksOfSection) {
      await SubTask.deleteMany({ task: task._id });
    }
    await Task.deleteMany({ section: sectionId });
    await Section.findByIdAndDelete(sectionId);
  }
}

module.exports = SectionService;
