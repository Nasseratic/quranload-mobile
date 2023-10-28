/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_ModuleHandle } from './System_ModuleHandle';
import type { System_Reflection_Assembly } from './System_Reflection_Assembly';
import type { System_Reflection_CustomAttributeData } from './System_Reflection_CustomAttributeData';

export type System_Reflection_Module = {
    assembly?: System_Reflection_Assembly;
    readonly fullyQualifiedName?: string | null;
    readonly name?: string | null;
    readonly mdStreamVersion?: number;
    readonly moduleVersionId?: string;
    readonly scopeName?: string | null;
    moduleHandle?: System_ModuleHandle;
    readonly customAttributes?: Array<System_Reflection_CustomAttributeData> | null;
    readonly metadataToken?: number;
};

