/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IdentityModel_Client_ResponseErrorType } from './IdentityModel_Client_ResponseErrorType';
import type { System_Exception } from './System_Exception';
import type { System_Net_Http_HttpResponseMessage } from './System_Net_Http_HttpResponseMessage';
import type { System_Net_HttpStatusCode } from './System_Net_HttpStatusCode';

export type IdentityModel_Client_TokenResponse = {
    httpResponse?: System_Net_Http_HttpResponseMessage;
    readonly raw?: string | null;
    readonly json?: any;
    exception?: System_Exception;
    readonly isError?: boolean;
    errorType?: IdentityModel_Client_ResponseErrorType;
    httpStatusCode?: System_Net_HttpStatusCode;
    readonly httpErrorReason?: string | null;
    readonly error?: string | null;
    readonly accessToken?: string | null;
    readonly identityToken?: string | null;
    readonly scope?: string | null;
    readonly issuedTokenType?: string | null;
    readonly tokenType?: string | null;
    readonly refreshToken?: string | null;
    readonly errorDescription?: string | null;
    readonly expiresIn?: number;
};

