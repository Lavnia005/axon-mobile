import { apiRequest } from "@/services/api";
import {
  CreateGroupData,
  Group,
  GroupRole,
  JoinGroupData,
  UpdateGroupData,
} from "@/types/group";

export const groupService = {
  getGroups(token: string) {
    return apiRequest<Group[]>("/groups", {
      method: "GET",
      token,
    });
  },

  getGroupById(id: string, token: string) {
    return apiRequest<Group>(`/groups/${id}`, {
      method: "GET",
      token,
    });
  },

  updateGroup(
    id: string,
    data: UpdateGroupData,
    token: string,
  ) {
    return apiRequest<{
      message: string;
      group: Group;
    }>(
      `/groups/${id}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify(data),
      },
    );
  },

  leaveGroup(
    groupId: string,
    token: string,
  ) {
    return apiRequest<{
      message: string;
    }>(
      `/groups/${groupId}/leave`,
      {
        method: "DELETE",
        token,
      },
    );
  },

  deleteGroup(
    groupId: string,
    token: string,
  ) {
    return apiRequest<{
      message: string;
    }>(
      `/groups/${groupId}`,
      {
        method: "DELETE",
        token,
      },
    );
  },

  createGroup(
    data: CreateGroupData,
    token: string,
  ) {
    return apiRequest<Group>("/groups", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  joinGroup(
    data: JoinGroupData,
    token: string,
  ) {
    return apiRequest<Group>("/groups/join", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  updateMemberRole(
    groupId: string,
    userId: string,
    role: GroupRole,
    token: string,
  ) {
    return apiRequest<{
      message: string;
      group: Group;
    }>(
      `/groups/${groupId}/members/${userId}/role`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify({
          role,
        }),
      },
    );
  },

  removeMember(
    groupId: string,
    userId: string,
    token: string,
  ) {
    return apiRequest<{
      message: string;
      group: Group;
    }>(
      `/groups/${groupId}/members/${userId}`,
      {
        method: "DELETE",
        token,
      },
    );
  },
};