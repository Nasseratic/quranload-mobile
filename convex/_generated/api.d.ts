/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as services_assignments from "../services/assignments.js";
import type * as services_auth from "../services/auth.js";
import type * as services_featureFlags from "../services/featureFlags.js";
import type * as services_lessons from "../services/lessons.js";
import type * as services_media from "../services/media.js";
import type * as services_messages from "../services/messages.js";
import type * as services_profile from "../services/profile.js";
import type * as services_pushNotifications from "../services/pushNotifications.js";
import type * as services_submissions from "../services/submissions.js";
import type * as services_support from "../services/support.js";
import type * as services_teams from "../services/teams.js";
import type * as services_user from "../services/user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 */
declare const fullApi: ApiFromModules<{
  "services/assignments": typeof services_assignments;
  "services/auth": typeof services_auth;
  "services/featureFlags": typeof services_featureFlags;
  "services/lessons": typeof services_lessons;
  "services/media": typeof services_media;
  "services/messages": typeof services_messages;
  "services/profile": typeof services_profile;
  "services/pushNotifications": typeof services_pushNotifications;
  "services/submissions": typeof services_submissions;
  "services/support": typeof services_support;
  "services/teams": typeof services_teams;
  "services/user": typeof services_user;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  pushNotifications: {
    public: {
      recordPushNotificationToken: FunctionReference<
        "mutation",
        "internal",
        {
          logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
          pushToken: string;
          userId: string;
        },
        null
      >;
      sendPushNotification: FunctionReference<
        "mutation",
        "internal",
        {
          allowUnregisteredTokens?: boolean;
          logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
          notification: {
            body?: string;
            data?: any;
            sound?: string;
            title: string;
          };
          userId: string;
        },
        string | null
      >;
    };
  };
};
