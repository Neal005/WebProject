const { Task, SubTask, Section } = require("../models");
const ApiError = require("../utils/apiError");

class TaskService {
  static async create({ sectionId, title, description, assignees }) {
    const countTasks = await Task.find({ section: sectionId }).count();

    const task = await Task.create({
      section: sectionId,
      title,
      description,
      assignees,
      position: countTasks > 0 ? countTasks : 0,
    });
    console.log({ task });
    return { task };
  }

  static async update(taskId, newTaskInfo) {
    let task = await Task.findById(taskId).lean();

    if (!task)
      throw (new ApiError(400), { errors: [{ msg: "Task not found" }] });

    task = await Task.findByIdAndUpdate(
      taskId,
      { $set: newTaskInfo },
      { new: true }
    );

    return { task };
  }

  static async updatePosition({
    sourceList,
    desList,
    sourceSectionId,
    desSectionId,
  }) {
    const sourceListReverse = sourceList.reverse();
    const desListReverse = desList.reverse();
    if (sourceSectionId !== desSectionId) {
      for (let key in sourceListReverse) {
        const task = sourceListReverse[key];
        await Task.findByIdAndUpdate(task._id, {
          $set: {
            section: sourceSectionId,
            position: key,
          },
        });
      }
    }

    for (let key in desListReverse) {
      const task = desListReverse[key];
      await Task.findByIdAndUpdate(task._id, {
        $set: {
          section: desSectionId,
          position: key,
        },
      });
    }
  }

  static async delete(taskId) {
    let task = await Task.findById(taskId).lean();

    if (!task) throw new ApiError(400, { errors: [{ msg: "Task not found" }] });

    await SubTask.deleteMany({ task: taskId });
    await Task.findByIdAndDelete(taskId);

    const section = await Section.findById(task.section);
    const restTasks = await Task.find({ section: section._id });

    for (let key in restTasks) {
      const item = restTasks[key];
      await Task.findByIdAndUpdate(item._id, { $set: { position: key } });
    }
  }
}

module.exports = TaskService;
