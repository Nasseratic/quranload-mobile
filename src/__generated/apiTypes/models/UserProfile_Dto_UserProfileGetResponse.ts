/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserProfile_Dto_TeamResponse } from './UserProfile_Dto_TeamResponse';

export type UserProfile_Dto_UserProfileGetResponse = {
    id?: string | null;
    fullName?: string | null;
    emailAddress?: string | null;
    phoneNumber?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    teams?: Array<UserProfile_Dto_TeamResponse> | null;
    roles?: Array<string> | null;
};

