import prisma from "../../config/db";

export const create = async (
  data: any
) => {
  const task =
    await prisma.task.create({
      data: {
        title: data.title,
        description:
          data.description,

        difficulty:
          data.difficulty,

        xpReward:
          data.xpReward,

        skillType:
          data.skillType,

        userId:
          data.userId
      }
    });

  return task;
};

export const getAllTasks =
  async () => {
    return await prisma.task.findMany();
  };

export const complete = async (
  taskId: string
) => {
  const task =
    await prisma.task.update({
      where: {
        id: taskId
      },

      data: {
        completed: true
      }
    });

  await prisma.user.update({
    where: {
      id: task.userId
    },

    data: {
      totalXP: {
        increment:
          task.xpReward
      }
    }
  });

  return {
    message:
      "Task completed",

    xpGained:
      task.xpReward
  };
};