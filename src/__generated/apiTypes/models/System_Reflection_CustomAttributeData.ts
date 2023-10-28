/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_ConstructorInfo } from './System_Reflection_ConstructorInfo';
import type { System_Reflection_CustomAttributeNamedArgument } from './System_Reflection_CustomAttributeNamedArgument';
import type { System_Reflection_CustomAttributeTypedArgument } from './System_Reflection_CustomAttributeTypedArgument';
import type { System_Type } from './System_Type';

export type System_Reflection_CustomAttributeData = {
    attributeType?: System_Type;
    constructor?: System_Reflection_ConstructorInfo;
    readonly constructorArguments?: Array<System_Reflection_CustomAttributeTypedArgument> | null;
    readonly namedArguments?: Array<System_Reflection_CustomAttributeNamedArgument> | null;
};

