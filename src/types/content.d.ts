declare namespace Frontend.Content {
  export interface AppBar {
    title: string;
    disableGoBack?: boolean;
  }

  export interface Lecture {
    title: string;
    institution: string;
  }

  export type AssignmentStatus = "done" | "pending" | "rejected";

  export interface Assignment {
    status: AssignmentStatus;
    text: string;
    deadline: string;
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
