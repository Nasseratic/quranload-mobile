/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_CustomAttributeData } from './System_Reflection_CustomAttributeData';
import type { System_Reflection_FieldAttributes } from './System_Reflection_FieldAttributes';
import type { System_Reflection_MemberTypes } from './System_Reflection_MemberTypes';
import type { System_Reflection_Module } from './System_Reflection_Module';
import type { System_RuntimeFieldHandle } from './System_RuntimeFieldHandle';
import type { System_Type } from './System_Type';

export type System_Reflection_FieldInfo = {
    readonly name?: string | null;
    declaringType?: System_Type;
    reflectedType?: System_Type;
    module?: System_Reflection_Module;
    readonly customAttributes?: Array<System_Reflection_CustomAttributeData> | null;
    readonly isCollectible?: boolean;
    readonly metadataToken?: number;
    memberType?: System_Reflection_MemberTypes;
    attributes?: System_Reflection_FieldAttributes;
    fieldType?: System_Type;
    readonly isInitOnly?: boolean;
    readonly isLiteral?: boolean;
    readonly isNotSerialized?: boolean;
    readonly isPinvokeImpl?: boolean;
    readonly isSpecialName?: boolean;
    readonly isStatic?: boolean;
    readonly isAssembly?: boolean;
    readonly isFamily?: boolean;
    readonly isFamilyAndAssembly?: boolean;
    readonly isFamilyOrAssembly?: boolean;
    readonly isPrivate?: boolean;
    readonly isPublic?: boolean;
    readonly isSecurityCritical?: boolean;
    readonly isSecuritySafeCritical?: boolean;
    readonly isSecurityTransparent?: boolean;
    fieldHandle?: System_RuntimeFieldHandle;
};

