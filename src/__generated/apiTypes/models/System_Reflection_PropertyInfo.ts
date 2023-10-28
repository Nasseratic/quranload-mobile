/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_CustomAttributeData } from './System_Reflection_CustomAttributeData';
import type { System_Reflection_MemberTypes } from './System_Reflection_MemberTypes';
import type { System_Reflection_MethodInfo } from './System_Reflection_MethodInfo';
import type { System_Reflection_Module } from './System_Reflection_Module';
import type { System_Reflection_PropertyAttributes } from './System_Reflection_PropertyAttributes';
import type { System_Type } from './System_Type';

export type System_Reflection_PropertyInfo = {
    readonly name?: string | null;
    declaringType?: System_Type;
    reflectedType?: System_Type;
    module?: System_Reflection_Module;
    readonly customAttributes?: Array<System_Reflection_CustomAttributeData> | null;
    readonly isCollectible?: boolean;
    readonly metadataToken?: number;
    memberType?: System_Reflection_MemberTypes;
    propertyType?: System_Type;
    attributes?: System_Reflection_PropertyAttributes;
    readonly isSpecialName?: boolean;
    readonly canRead?: boolean;
    readonly canWrite?: boolean;
    getMethod?: System_Reflection_MethodInfo;
    setMethod?: System_Reflection_MethodInfo;
};

