/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Enum_AssignmentType } from './Enum_AssignmentType';
import type { Enum_LessonState } from './Enum_LessonState';
import type { Lessons_Dto_LessonSubmissionDto } from './Lessons_Dto_LessonSubmissionDto';
import type { Media_Dto_MediaDto } from './Media_Dto_MediaDto';

export type Lessons_Dto_LessonDetailResponse = {
    id?: string;
    assignmentId?: string;
    status?: Enum_LessonState;
    assignmentStartPage?: number;
    startPage?: number;
    endPage?: number;
    createdAt?: string;
    teamId?: string;
    typeId?: Enum_AssignmentType;
    lessonSubmissions?: Array<Lessons_Dto_LessonSubmissionDto> | null;
    attachments?: Array<Media_Dto_MediaDto> | null;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
};

