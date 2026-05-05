/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aha from "../aha.js";
import type * as auth from "../auth.js";
import type * as dashboard from "../dashboard.js";
import type * as floatingNotes from "../floatingNotes.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as profiles from "../profiles.js";
import type * as reactions from "../reactions.js";
import type * as rooms from "../rooms.js";
import type * as sessions from "../sessions.js";
import type * as signaling from "../signaling.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";
import type * as whiteboard from "../whiteboard.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aha: typeof aha;
  auth: typeof auth;
  dashboard: typeof dashboard;
  floatingNotes: typeof floatingNotes;
  messages: typeof messages;
  notes: typeof notes;
  profiles: typeof profiles;
  reactions: typeof reactions;
  rooms: typeof rooms;
  sessions: typeof sessions;
  signaling: typeof signaling;
  todos: typeof todos;
  users: typeof users;
  whiteboard: typeof whiteboard;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
