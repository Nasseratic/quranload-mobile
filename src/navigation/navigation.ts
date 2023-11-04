import { Assignment } from "hooks/queries/assignments";

export type RootStackParamList = {
  StudentHome: undefined;
  Assignments: {
    teamId: string;
  };
  Login: undefined;
  Profile: undefined;
  Record: {
    studentId?: string;
    assignment: Pick<
      Assignment,
      "id" | "startPage" | "endPage" | "feedbackUrl" | "recordingUrl" | "attachments" | "typeId"
    >;
  };
  RecordSettings: undefined;
  ResetPassword: undefined;
  RegisterAccount: undefined;
  AdvancedSettings: undefined;
  ChangePassword: undefined;
  ChangeLanguage: undefined;
  Subscriptions: undefined;
  CancelSubscription: {
    subscription: Frontend.Content.Subscription;
  };
  TeacherHome: undefined;
  TeacherHomework: { teamId: string };
  TeacherSubmissions: { homework: Assignment };
  TeacherCreateHomework: {
    teamId: string;
  };
  TeacherAutoHomework: undefined;
  TeacherStudentsList: { teamId: string };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
