export type TaskGroup = {
  _id: string;
  name: string;
};

export type TaskCreator = {
  _id: string;
  name: string;
};

export type Task = {
  _id: string;

  title: string;
  description?: string;

  points: number;

  group: TaskGroup | string;
  createdBy: TaskCreator | string;

  startsAt: string;
  deadline: string;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateTaskData = {
  title: string;
  description?: string;

  points: number;

  group: string;

  startsAt: string;
  deadline: string;
};

export type UpdateTaskData = {
  title?: string;
  description?: string;

  points?: number;

  startsAt?: string;
  deadline?: string;
};

export type TasksResponse = {
  message: string;
  tasks: Task[];
};

export type TaskResponse = {
  message: string;
  task: Task;
};