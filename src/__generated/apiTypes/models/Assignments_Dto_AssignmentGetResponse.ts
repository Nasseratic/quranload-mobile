/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Enum_AssignmentType } from './Enum_AssignmentType';
import type { Media_Dto_MediaDto } from './Media_Dto_MediaDto';

export type Assignments_Dto_AssignmentGetResponse = {
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
    attachments?: Array<Media_Dto_MediaDto> | null;
    totalRegisteredStudents?: number;
    totalSubmittedStudents?: number;
};

