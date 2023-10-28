/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Enum_LessonState } from './Enum_LessonState';
import type { Media_Dto_MediaDto } from './Media_Dto_MediaDto';
import type { UserProfile_Dto_UserProfileGetResponse } from './UserProfile_Dto_UserProfileGetResponse';

export type Lessons_Dto_LessonSubmissionDto = {
    id?: string;
    recording?: Media_Dto_MediaDto;
    feedback?: Media_Dto_MediaDto;
    student?: UserProfile_Dto_UserProfileGetResponse;
    status?: Enum_LessonState;
};

