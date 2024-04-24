const { Project, Section, Task, SubTask } = require("../models");
const projectModel = require("../models/project.model");
const subtaskModel = require("../models/subtask.model");
const ApiError = require("../utils/apiError");

class ProjectService {
  static async create({ name, color, owner, members = [] }) {
    const project = await Project.create({
      name,
      color,
      owner,
      members,
    });

    return {
      project,
    };
  }

  static async getAll(userId) {
    const ownProjects = await Project.find({ owner: userId }).lean();
    const otherProjects = await Project.find({
      members: userId,
    }).lean();

    return {
      projects: [...ownProjects, ...otherProjects],
    };
  }

  static async getOne(userId, projectId) {
    let project = await Project.findOne({
      owner: userId,
      _id: projectId,
    }).lean();
    if (!project)
      project = await Project.findOne({
        _id: projectId,
        members: userId,
      }).lean();
    if (!project)
      throw new ApiError(404, [
        {
          msg: "Project not found!",
        },
      ]);
    const sectionsOfProject = await Section.find({ project: projectId }).lean();
    for (let section of sectionsOfProject) {
      const tasksOfSection = await Task.find({ section: section._id })
        .populate("section")
        .sort("-position")
        .lean();
      for (let task of tasksOfSection) {
        const subtasksOfTask = await SubTask.find({ task: task._id }).lean();

        task.subTasks = subtasksOfTask;
      }
      section.tasks = tasksOfSection;
    }
    project.sections = sectionsOfProject;
    return {
      project,
    };
  }

  static async getPinnedProjects(userId) {
    const onwProjects = await Project.find({
      owner: userId,
      pinnedUsers: userId,
    }).lean();
    const memberProjects = await Project.find({
      members: userId,
      pinnedUsers: userId,
    }).lean();
    return { projects: [...onwProjects, ...memberProjects] };
  }

  static async update(projectId, newProjectInfo) {
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: newProjectInfo,
      },
      { new: true }
    );
    return { project };
  }

  static async delete(projectId) {
    const sectionsOfProject = await Section.find({ project: projectId }).lean();
    for (let section of sectionsOfProject) {
      const tasksOfSection = await Task.find({ section: section._id });
      for (let task in tasksOfSection) {
        await SubTask.deleteMany({ task: task._id });
      }
      await Task.deleteMany({ section: section._id });
    }
    await Section.deleteMany({ project: projectId });

    await Project.findByIdAndDelete(projectId);
  }
}

module.exports = ProjectService;
