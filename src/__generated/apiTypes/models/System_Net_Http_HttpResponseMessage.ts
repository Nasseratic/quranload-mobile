/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { System_Collections_Generic_KeyValuePair_2 } from "./System_Collections_Generic_KeyValuePair_2";
import type { System_Net_Http_HttpContent } from "./System_Net_Http_HttpContent";
import type { System_Net_Http_HttpRequestMessage } from "./System_Net_Http_HttpRequestMessage";
import type { System_Net_HttpStatusCode } from "./System_Net_HttpStatusCode";
import type { System_Version } from "./System_Version";

export type System_Net_Http_HttpResponseMessage = {
  version?: System_Version;
  content?: System_Net_Http_HttpContent;
  statusCode?: System_Net_HttpStatusCode;
  reasonPhrase?: string | null;
  readonly headers?: Array<System_Collections_Generic_KeyValuePair_2> | null;
  readonly trailingHeaders?: Array<System_Collections_Generic_KeyValuePair_2> | null;
  requestMessage?: System_Net_Http_HttpRequestMessage;
  readonly isSuccessStatusCode?: boolean;
};
