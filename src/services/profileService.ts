import { apiRequest } from "@/services/api";

import {
  ChangePasswordData,
  MessageResponse,
  ProfileImageResponse,
  ProfileResponse,
  UpdateProfileData,
  UpdateProfileResponse,
} from "@/types/profile";

export type ProfileImageUpload = {
  uri: string;
  name: string;
  type: string;
};

export const profileService = {
  getProfile(
    token: string,
  ) {
    return apiRequest<ProfileResponse>(
      "/users/me",
      {
        method: "GET",
        token,
      },
    );
  },

  updateProfile(
    data: UpdateProfileData,
    token: string,
  ) {
    return apiRequest<UpdateProfileResponse>(
      "/users/me",
      {
        method: "PUT",
        token,

        body:
          JSON.stringify(
            data,
          ),
      },
    );
  },

  updateProfileImage(
    image: ProfileImageUpload,
    token: string,
  ) {
    const formData =
      new FormData();

    formData.append(
      "profileImage",
      {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any,
    );

    return apiRequest<ProfileImageResponse>(
      "/users/profile-image",
      {
        method: "PATCH",
        token,
        body: formData,
      },
    );
  },

  changePassword(
    data: ChangePasswordData,
    token: string,
  ) {
    return apiRequest<MessageResponse>(
      "/users/change-password",
      {
        method: "PATCH",
        token,

        body:
          JSON.stringify(
            data,
          ),
      },
    );
  },
};