declare namespace Frontend.Content {
  export type AssignmentStatus = "submitted" | "pending" | "rejected";

  enum AssignmentStatusEnum {
    pending,
    rejected,
    accepted,
    submitted,
  }

  export interface Assignment {
    id: string;
    status: AssignmentStatusEnum;
    description: string;
    endDate: string;
    startPage: number;
    endPage: number;
    teamId: string;
    recordingUrl: string;
    feedbackUrl: string;
  }

  export interface ApiError {
    code: string;
    errors: unknown;
    message: string;
  }

  export interface Subscription {
    id: string;
    teamId: string;
    teamName: string;
    organizationName: string;
    enrollmentDate: Date;
    paidUntil: Date;
    createdAt: Date;
    renewalDate: Date;
    paidAmount: number;
    expiredAtDate: Date;
    image: string;
  }

  export interface Submission {
    fullname: string;
    submittedAtDate?: Date;
    isFeedbackGiven: boolean;
  }

  export interface AutoHW {
    teamId: string;
    weekDays: [{ day: string; hasHomeWork: boolean }];
    pagesPerDay: number;
    startFromPage: number;
  }
}
