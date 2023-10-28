/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Assignments_Dto_QuranLessonDto } from './Assignments_Dto_QuranLessonDto';
import type { Enum_AssignmentType } from './Enum_AssignmentType';
import type { Lessons_Dto_LessonDto } from './Lessons_Dto_LessonDto';

export type Assignments_Dto_QuranAssignmentGetResponse = {
    id?: string;
    typeId?: Enum_AssignmentType;
    days?: number;
    pagesPerDay?: number;
    startFromPage?: number;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    teamId?: string;
    createdAt?: string;
    modifiedAt?: string;
    lessons?: Array<Lessons_Dto_LessonDto> | null;
    quranLessonDto?: Assignments_Dto_QuranLessonDto;
};

