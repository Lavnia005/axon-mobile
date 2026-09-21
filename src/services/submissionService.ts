import { apiRequest } from "@/services/api";

import {
  SubmissionResponse,
  SubmissionsResponse,
  ValidateSubmissionData,
  VoteSubmissionData,
  VoteSubmissionResponse,
} from "@/types/submission";

export type EvidenceImage = {
  uri: string;
  name: string;
  type: string;
};

export const submissionService = {
  submitEvidence(
    taskId: string,
    image: EvidenceImage,
    token: string,
  ) {
    const formData = new FormData();

    formData.append(
      "task",
      taskId,
    );

    formData.append(
      "evidence",
      {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any,
    );

    return apiRequest<SubmissionResponse>(
      "/task-submissions",
      {
        method: "POST",
        token,
        body: formData,
      },
    );
  },

  getMySubmissions(
    token: string,
  ) {
    return apiRequest<SubmissionsResponse>(
      "/task-submissions/my",
      {
        method: "GET",
        token,
      },
    );
  },

  getPendingValidations(
    token: string,
  ) {
    return apiRequest<SubmissionsResponse>(
      "/task-submissions/pending",
      {
        method: "GET",
        token,
      },
    );
  },

  getSubmissionById(
    id: string,
    token: string,
  ) {
    return apiRequest<SubmissionResponse>(
      `/task-submissions/${id}`,
      {
        method: "GET",
        token,
      },
    );
  },

  validateSubmission(
    id: string,
    data: ValidateSubmissionData,
    token: string,
  ) {
    return apiRequest<SubmissionResponse>(
      `/task-submissions/${id}/validate`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify(data),
      },
    );
  },

  voteSubmission(
    id: string,
    data: VoteSubmissionData,
    token: string,
  ) {
    return apiRequest<VoteSubmissionResponse>(
      `/task-submissions/${id}/vote`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify(data),
      },
    );
  },
};