/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Enum_LessonState } from './Enum_LessonState';

export type Lessons_Dto_LessonEditRequest = {
    recordingUrl?: string | null;
    feedbackUrl?: string | null;
    id?: string;
    recordingDuration?: number | null;
    status?: Enum_LessonState;
};

