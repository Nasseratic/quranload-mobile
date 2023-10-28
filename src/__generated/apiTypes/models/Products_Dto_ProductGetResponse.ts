/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Teams_Dto_TeamDto } from './Teams_Dto_TeamDto';

export type Products_Dto_ProductGetResponse = {
    name?: string | null;
    fee?: number;
    gender?: string | null;
    description?: string | null;
    isActive?: boolean;
    courseStart?: string;
    courseEnd?: string;
    registrationStart?: string;
    registrationEnd?: string;
    stripePriceId?: string | null;
    id?: string;
    createdAt?: string;
    createdById?: string;
    modifiedAt?: string | null;
    modifiedById?: string | null;
    slotsLeft?: number;
    totalSlots?: number;
    isAssignedLevel?: boolean;
    isExUser?: boolean;
    unSubMonths?: number;
    commission?: number | null;
    connectedAccountId?: string | null;
    teams?: Array<Teams_Dto_TeamDto> | null;
};

