declare namespace Frontend.Navigation {
  export type RootStackParamList = {
    StudentHome: undefined;
    Assignments: {
      teamId: string;
    };
    Login: undefined;
    Profile: undefined;
    Record: { assignment: Frontend.Content.Assignment };
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
  };
}
