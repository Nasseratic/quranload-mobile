declare namespace Frontend.Content {
  export interface AppBar {
    title: string;
    disableGoBack?: boolean;
  }

  export interface Team {
    id: string;
    title: string;
    image: string;
    institution: string;
    assignments: number;
  }

  export type AssignmentStatus = "done" | "pending" | "rejected";

  export interface Assignment {
    status: AssignmentStatus;
    description: string;
    endDate: string;
  }

  export interface Subscription {
    id: string;
    name: string;
    institution: string;
    startDate: string;
    expireDate: string;
    nextPayment: string;
    frequence: string;
    amount: string;
    image: string;
  }
}
