/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { QD_WebApi_Controllers_Shared_Gender } from './QD_WebApi_Controllers_Shared_Gender';

export type QD_WebApi_Controllers_Account_Requests_RegisterRequest = {
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    gender?: QD_WebApi_Controllers_Shared_Gender;
    dateofBirth?: string;
    phone?: string | null;
};

