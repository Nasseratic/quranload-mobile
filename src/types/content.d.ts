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
}
