// Stub for unfinished tasks service to allow clean compilation and disable the feature.

export const create = async (data: any) => {
  return {};
};

export const getAllTasks = async () => {
  return [];
};

export const complete = async (taskId: string) => {
  return {
    message: "Task completion is disabled.",
    xpGained: 0
  };
};