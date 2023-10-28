/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_CustomAttributeData } from './System_Reflection_CustomAttributeData';
import type { System_Reflection_MemberInfo } from './System_Reflection_MemberInfo';
import type { System_Reflection_ParameterAttributes } from './System_Reflection_ParameterAttributes';
import type { System_Type } from './System_Type';

export type System_Reflection_ParameterInfo = {
    attributes?: System_Reflection_ParameterAttributes;
    member?: System_Reflection_MemberInfo;
    readonly name?: string | null;
    parameterType?: System_Type;
    readonly position?: number;
    readonly isIn?: boolean;
    readonly isLcid?: boolean;
    readonly isOptional?: boolean;
    readonly isOut?: boolean;
    readonly isRetval?: boolean;
    readonly defaultValue?: any;
    readonly rawDefaultValue?: any;
    readonly hasDefaultValue?: boolean;
    readonly customAttributes?: Array<System_Reflection_CustomAttributeData> | null;
    readonly metadataToken?: number;
};

