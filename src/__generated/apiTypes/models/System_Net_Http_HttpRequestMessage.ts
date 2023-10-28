/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Collections_Generic_KeyValuePair_2 } from "./System_Collections_Generic_KeyValuePair_2";
import type { System_Net_Http_HttpContent } from "./System_Net_Http_HttpContent";
import type { System_Net_Http_HttpMethod } from "./System_Net_Http_HttpMethod";
import type { System_Net_Http_HttpVersionPolicy } from "./System_Net_Http_HttpVersionPolicy";
import type { System_Version } from "./System_Version";

export type System_Net_Http_HttpRequestMessage = {
  version?: System_Version;
  versionPolicy?: System_Net_Http_HttpVersionPolicy;
  content?: System_Net_Http_HttpContent;
  method?: System_Net_Http_HttpMethod;
  requestUri?: string | null;
  readonly headers?: Array<System_Collections_Generic_KeyValuePair_2> | null;
  /**
   * @deprecated
   */
  readonly properties?: Record<string, any> | null;
  readonly options?: Record<string, any> | null;
};
