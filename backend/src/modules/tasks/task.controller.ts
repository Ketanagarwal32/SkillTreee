import {
  create,
  getAllTasks,
  complete
} from "./task.service";

export const createTask = async (
  req: any,
  res: any
) => {
  try {
    const task =
      await create(req.body);

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getTasks = async (
  req: any,
  res: any
) => {
  try {
    const tasks =
      await getAllTasks();

    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const completeTask = async (
  req: any,
  res: any
) => {
  try {
    const result =
      await complete(
        req.params.id
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: error.message
    });
  }
};