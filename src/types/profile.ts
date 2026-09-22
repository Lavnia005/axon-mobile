export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  phone: string;
  profileImage?: string | null;
  isVerified?: boolean;

  createdAt?: string;
};

export type ProfileResponse = {
  user: ProfileUser;
};

export type UpdateProfileData = {
  name?: string;
  phone?: string;
  birthDate?: string;
};

export type UpdateProfileResponse = {
  message: string;
  user: ProfileUser;
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type MessageResponse = {
  message: string;
};

export type ProfileImageResponse = {
  message: string;
  profileImage: string;
};