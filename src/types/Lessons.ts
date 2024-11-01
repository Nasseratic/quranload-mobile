export enum AssignmentStatusEnum {
  pending,
  rejected,
  accepted,
  submitted,
}
export const lessonStatusFromEnumToType = (
  status: AssignmentStatusEnum
): Frontend.Content.AssignmentStatus => {
  switch (status) {
    case AssignmentStatusEnum.accepted:
      return "accepted" as Frontend.Content.AssignmentStatus;
    case AssignmentStatusEnum.submitted:
      return "submitted" as Frontend.Content.AssignmentStatus;
    case AssignmentStatusEnum.pending:
      return "pending" as Frontend.Content.AssignmentStatus;
    case AssignmentStatusEnum.rejected:
      return "rejected" as Frontend.Content.AssignmentStatus;
    default:
      return "pending" as Frontend.Content.AssignmentStatus;
  }
};
