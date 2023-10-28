/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Enum_AssignmentType } from './Enum_AssignmentType';
import type { Media_Dto_MediaDtoEdit } from './Media_Dto_MediaDtoEdit';

export type Assignments_Dto_AssignmentEditRequest = {
    id?: string;
    typeId?: Enum_AssignmentType;
    days?: number;
    pagesPerDay?: number;
    startFromPage?: number;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    teamId?: string;
    attachments?: Array<Media_Dto_MediaDtoEdit> | null;
};

