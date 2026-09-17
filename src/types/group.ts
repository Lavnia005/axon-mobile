export type GroupRole = "admin" | "member";

export type GroupUser = {
  _id: string;
  name: string;
  email: string;
  profileImage?: {
    url?: string;
    publicId?: string;
  };
};

export type GroupMember = {
  user: GroupUser | string;
  role: GroupRole;
  points: number;
  pointsUpdatedAt?: string;
};

export type Group = {
  _id: string;
  name: string;
  description?: string;
  code: string;
  maxMembers: number;
  creator: GroupUser | string;
  members: GroupMember[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateGroupData = {
  name: string;
  description?: string;
  password?: string;
  maxMembers?: number;
};

export type UpdateGroupData = {
  name?: string;
  description?: string;
  password?: string;
  maxMembers?: number;
};

export type JoinGroupData = {
  code: string;
  password?: string;
};