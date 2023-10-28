/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Reflection_CustomAttributeData } from './System_Reflection_CustomAttributeData';
import type { System_Reflection_MethodInfo } from './System_Reflection_MethodInfo';
import type { System_Reflection_Module } from './System_Reflection_Module';
import type { System_Reflection_TypeInfo } from './System_Reflection_TypeInfo';
import type { System_Security_SecurityRuleSet } from './System_Security_SecurityRuleSet';
import type { System_Type } from './System_Type';

export type System_Reflection_Assembly = {
    readonly definedTypes?: Array<System_Reflection_TypeInfo> | null;
    readonly exportedTypes?: Array<System_Type> | null;
    readonly codeBase?: string | null;
    entryPoint?: System_Reflection_MethodInfo;
    readonly fullName?: string | null;
    readonly imageRuntimeVersion?: string | null;
    readonly isDynamic?: boolean;
    readonly location?: string | null;
    readonly reflectionOnly?: boolean;
    readonly isCollectible?: boolean;
    readonly isFullyTrusted?: boolean;
    readonly customAttributes?: Array<System_Reflection_CustomAttributeData> | null;
    readonly escapedCodeBase?: string | null;
    manifestModule?: System_Reflection_Module;
    readonly modules?: Array<System_Reflection_Module> | null;
    /**
     * @deprecated
     */
    readonly globalAssemblyCache?: boolean;
    readonly hostContext?: number;
    securityRuleSet?: System_Security_SecurityRuleSet;
};

