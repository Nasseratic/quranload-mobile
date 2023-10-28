/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Lessons_Dto_AssignmentVelocity } from './Lessons_Dto_AssignmentVelocity';

export type Lessons_Dto_LessonStudentStatGetResponse = {
    firstSubmission?: string | null;
    lastSubmission?: string | null;
    assignmentVelocities?: Array<Lessons_Dto_AssignmentVelocity> | null;
    todaySpendMinutes?: number;
    totalRecordingHours?: number;
    totalNumberOfPagesRead?: number;
    readonly averageTimePerPage?: number;
};

