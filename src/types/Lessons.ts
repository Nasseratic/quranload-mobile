export enum AssignmentStatusEnum {
  pending,
  rejected,
  accepted,
  submitted,
}

export const LessonStatusFromEnumToType = (
  status: AssignmentStatusEnum
): Frontend.Content.AssignmentStatus => {
  switch (status) {
  case AssignmentStatusEnum.accepted:
    return "done";
  case AssignmentStatusEnum.submitted:
    return "done";
  case AssignmentStatusEnum.pending:
    return "pending";
  case AssignmentStatusEnum.rejected:
    return "rejected";
  }
};

export const LessonStatusFromTypeToEnum = (
  status: Frontend.Content.AssignmentStatus
): AssignmentStatusEnum => {
  if (status === "pending") {
    return AssignmentStatusEnum.pending;
  } else if (status === "rejected") {
    return AssignmentStatusEnum.rejected;
  } else if (status === "done") {
    return AssignmentStatusEnum.accepted;
  } else {
    return AssignmentStatusEnum.pending;
  }
};
