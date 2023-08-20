declare namespace Frontend.Content {
  export interface AppBar {
    title: string;
    disableGoBack?: boolean;
  }

  export type AssignmentStatus = "submitted" | "pending" | "rejected";

  enum AssignmentStatusEnum {
    pending,
    rejected,
    accepted,
    submitted,
  }

  export interface Assignment {
    status: AssignmentStatusEnum;
    description: string;
    endDate: string;
    startPage: number;
    endPage: number;
    teamId: string;
  }

  export interface ApiError {
    code: string;
    errors: never;
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
}
