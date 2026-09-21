import { Task } from "@/types/task";

export type SubmissionStatus =
  | "accepted"
  | "voting"
  | "invalidated";

export type ValidationAction =
  | "approved"
  | "contested";

export type VoteDecision =
  | "accepted"
  | "invalidated";

export type FinalDecision =
  | "accepted"
  | "invalidated";

export type SubmissionUser = {
  _id: string;
  name: string;
  profileImage?: string | null;
};

export type SubmissionGroup = {
  _id: string;
  name: string;
};

export type SubmissionTask = Omit<
  Task,
  "group" | "createdBy"
> & {
  group:
    | string
    | SubmissionGroup;
};

export type SubmissionEvidence = {
  url: string;
  publicId: string;
};

export type SubmissionContest = {
  reason: string;

  createdBy:
    | string
    | SubmissionUser;

  createdAt: string;

  resolved: boolean;
};

export type InitialValidation = {
  user:
    | string
    | SubmissionUser;

  action: ValidationAction;
};

export type SubmissionVote = {
  user:
    | string
    | SubmissionUser;

  decision: VoteDecision;
};

export type TaskSubmission = {
  _id: string;

  task:
    | string
    | SubmissionTask;

  user:
    | string
    | SubmissionUser;

  evidence: SubmissionEvidence;

  status: SubmissionStatus;

  contest?:
    | SubmissionContest
    | null;

  votes: SubmissionVote[];

  initialValidations:
    InitialValidation[];

  rewardProcessed: boolean;

  finishedAt?:
    | string
    | null;

  finalDecision?:
    | FinalDecision
    | null;

  createdAt: string;

  updatedAt: string;
};

export type SubmissionsResponse = {
  submissions:
    TaskSubmission[];
};

export type SubmissionResponse = {
  submission:
    TaskSubmission;

  message?: string;
};

export type ValidateSubmissionData = {
  action: ValidationAction;

  reason?: string;
};

export type VoteSubmissionData = {
  decision: VoteDecision;
};

export type VoteSubmissionResponse = {
  message: string;

  submission:
    TaskSubmission;

  finalDecision?:
    FinalDecision;
};