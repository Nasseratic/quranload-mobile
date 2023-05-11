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
}
