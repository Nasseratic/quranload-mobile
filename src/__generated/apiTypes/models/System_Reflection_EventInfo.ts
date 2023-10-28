/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_CustomAttributeData } from './System_Reflection_CustomAttributeData';
import type { System_Reflection_EventAttributes } from './System_Reflection_EventAttributes';
import type { System_Reflection_MemberTypes } from './System_Reflection_MemberTypes';
import type { System_Reflection_MethodInfo } from './System_Reflection_MethodInfo';
import type { System_Reflection_Module } from './System_Reflection_Module';
import type { System_Type } from './System_Type';

export type System_Reflection_EventInfo = {
    readonly name?: string | null;
    declaringType?: System_Type;
    reflectedType?: System_Type;
    module?: System_Reflection_Module;
    readonly customAttributes?: Array<System_Reflection_CustomAttributeData> | null;
    readonly isCollectible?: boolean;
    readonly metadataToken?: number;
    memberType?: System_Reflection_MemberTypes;
    attributes?: System_Reflection_EventAttributes;
    readonly isSpecialName?: boolean;
    addMethod?: System_Reflection_MethodInfo;
    removeMethod?: System_Reflection_MethodInfo;
    raiseMethod?: System_Reflection_MethodInfo;
    readonly isMulticast?: boolean;
    eventHandlerType?: System_Type;
};

