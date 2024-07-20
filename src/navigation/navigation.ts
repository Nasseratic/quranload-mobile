import { Assignment } from "hooks/queries/assignments";
import { User, Team } from "types/User";

export type RootStackParamList = {
  StudentHome: undefined;
  Assignments: {
    teamId: string;
  };
  Login: undefined;
  Profile: undefined;
  Record: {
    readOnly?: boolean;
    studentId?: string;
    assignment: Pick<
      Assignment,
      | "id"
      | "startPage"
      | "endPage"
      | "feedbackUrl"
      | "recordingUrl"
      | "attachments"
      | "typeId"
      | "description"
    >;
  };
  RecordSettings: undefined;
  ResetPassword: {
    code: string;
  };
  ConfirmEmailScreen: {
    code: string;
    userId: string;
  };
  ForgotPassword: undefined;
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
    assignment?: Assignment;
  };
  TeacherAutoHomework: {
    teamId: string;
    weekDays: { day: string; hasHomeWork: boolean }[];
    assignmentId?: string;
    pagesPerDay?: number;
    startFromPage?: number;
  };
  TeacherStudentsList: { teamId: string };
  Mushaf: undefined;
  ChatScreen: { teamId: string; interlocutorId?: string; title: string };
  ChatListScreen: { team: Team };
  ChatNewScreen: { team: Team };
  TeamListScreen: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
