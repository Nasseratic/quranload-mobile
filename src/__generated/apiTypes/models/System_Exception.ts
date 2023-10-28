/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_MethodBase } from './System_Reflection_MethodBase';

export type System_Exception = {
    targetSite?: System_Reflection_MethodBase;
    readonly message?: string | null;
    readonly data?: Record<string, any> | null;
    innerException?: System_Exception;
    helpLink?: string | null;
    source?: string | null;
    hResult?: number;
    readonly stackTrace?: string | null;
};

