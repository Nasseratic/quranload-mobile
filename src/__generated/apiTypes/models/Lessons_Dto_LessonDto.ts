/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Enum_LessonState } from './Enum_LessonState';

export type Lessons_Dto_LessonDto = {
    id?: string;
    assignmentId?: string;
    status?: Enum_LessonState;
    assignmentStartPage?: number;
    startPage?: number;
    endPage?: number;
    createdAt?: string;
};

