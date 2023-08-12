declare namespace Frontend.Navigation {
  export type RootStackParamList = {
    Dashboard: undefined;
    Assignments: {
      teamId: string;
    };
    Login: undefined;
    Profile: undefined;
    Record: undefined;
    RecordSettings: undefined;
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
