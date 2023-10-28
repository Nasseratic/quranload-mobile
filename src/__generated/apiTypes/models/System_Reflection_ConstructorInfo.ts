/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_CallingConventions } from './System_Reflection_CallingConventions';
import type { System_Reflection_CustomAttributeData } from './System_Reflection_CustomAttributeData';
import type { System_Reflection_MemberTypes } from './System_Reflection_MemberTypes';
import type { System_Reflection_MethodAttributes } from './System_Reflection_MethodAttributes';
import type { System_Reflection_MethodImplAttributes } from './System_Reflection_MethodImplAttributes';
import type { System_Reflection_Module } from './System_Reflection_Module';
import type { System_RuntimeMethodHandle } from './System_RuntimeMethodHandle';
import type { System_Type } from './System_Type';

export type System_Reflection_ConstructorInfo = {
    readonly name?: string | null;
    declaringType?: System_Type;
    reflectedType?: System_Type;
    module?: System_Reflection_Module;
    readonly customAttributes?: Array<System_Reflection_CustomAttributeData> | null;
    readonly isCollectible?: boolean;
    readonly metadataToken?: number;
    attributes?: System_Reflection_MethodAttributes;
    methodImplementationFlags?: System_Reflection_MethodImplAttributes;
    callingConvention?: System_Reflection_CallingConventions;
    readonly isAbstract?: boolean;
    readonly isConstructor?: boolean;
    readonly isFinal?: boolean;
    readonly isHideBySig?: boolean;
    readonly isSpecialName?: boolean;
    readonly isStatic?: boolean;
    readonly isVirtual?: boolean;
    readonly isAssembly?: boolean;
    readonly isFamily?: boolean;
    readonly isFamilyAndAssembly?: boolean;
    readonly isFamilyOrAssembly?: boolean;
    readonly isPrivate?: boolean;
    readonly isPublic?: boolean;
    readonly isConstructedGenericMethod?: boolean;
    readonly isGenericMethod?: boolean;
    readonly isGenericMethodDefinition?: boolean;
    readonly containsGenericParameters?: boolean;
    methodHandle?: System_RuntimeMethodHandle;
    readonly isSecurityCritical?: boolean;
    readonly isSecuritySafeCritical?: boolean;
    readonly isSecurityTransparent?: boolean;
    memberType?: System_Reflection_MemberTypes;
};

