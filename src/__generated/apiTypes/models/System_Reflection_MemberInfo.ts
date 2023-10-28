/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_CustomAttributeData } from './System_Reflection_CustomAttributeData';
import type { System_Reflection_MemberTypes } from './System_Reflection_MemberTypes';
import type { System_Reflection_Module } from './System_Reflection_Module';
import type { System_Type } from './System_Type';

export type System_Reflection_MemberInfo = {
    memberType?: System_Reflection_MemberTypes;
    declaringType?: System_Type;
    reflectedType?: System_Type;
    readonly name?: string | null;
    module?: System_Reflection_Module;
    readonly customAttributes?: Array<System_Reflection_CustomAttributeData> | null;
    readonly isCollectible?: boolean;
    readonly metadataToken?: number;
};

