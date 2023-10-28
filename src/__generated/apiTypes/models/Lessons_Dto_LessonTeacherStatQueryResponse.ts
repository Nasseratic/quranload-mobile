/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Lessons_Dto_TeacherLessonsStatForTeamQueryResponse } from './Lessons_Dto_TeacherLessonsStatForTeamQueryResponse';

export type Lessons_Dto_LessonTeacherStatQueryResponse = {
    totalSubmissions?: number;
    totalRejections?: number;
    totalMissed?: number;
    totalApprovedMinutes?: number;
    totalApprovedPages?: number;
    statsForTeam?: Array<Lessons_Dto_TeacherLessonsStatForTeamQueryResponse> | null;
};

