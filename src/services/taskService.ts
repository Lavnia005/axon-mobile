import { apiRequest } from "@/services/api";
import {
  CreateTaskData,
  TaskResponse,
  TasksResponse,
  UpdateTaskData,
} from "@/types/task";

export const taskService = {
  getMyTasks(token: string) {
    return apiRequest<TasksResponse>("/tasks/my", {
      method: "GET",
      token,
    });
  },

  getTaskHistory(token: string) {
    return apiRequest<TasksResponse>("/tasks/history", {
      method: "GET",
      token,
    });
  },

  getGroupTasks(groupId: string, token: string) {
    return apiRequest<TasksResponse>(`/tasks/group/${groupId}`, {
      method: "GET",
      token,
    });
  },

  getTaskById(id: string, token: string) {
    return apiRequest<TaskResponse>(`/tasks/${id}`, {
      method: "GET",
      token,
    });
  },

  createTask(data: CreateTaskData, token: string) {
    return apiRequest<TaskResponse>("/tasks", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  updateTask(
    id: string,
    data: UpdateTaskData,
    token: string,
  ) {
    return apiRequest<TaskResponse>(`/tasks/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    });
  },

  deleteTask(id: string, token: string) {
    return apiRequest<{ message: string }>(`/tasks/${id}`, {
      method: "DELETE",
      token,
    });
  },
};