import { ValidationError } from "./errors.js";
import { VERSION } from "../version.js";

export const SDK_PRODUCT = "elfa-sdk-js";
export const APP_NAME_MAX_LENGTH = 100;

/**
 * Printable ASCII only: header values must be ByteStrings, and anything
 * outside this range either throws in `fetch` or is rejected by Node's HTTP
 * client, failing the request rather than the construction.
 */
const APP_NAME_PATTERN = /^[\x20-\x7e]+$/;

/**
 * Validates and trims an integrator's `appName`. Throws `ValidationError` for
 * an empty value, one longer than {@link APP_NAME_MAX_LENGTH}, or one with
 * characters outside printable ASCII.
 */
export function normalizeAppName(
  appName: string | undefined,
): string | undefined {
  if (appName === undefined) return undefined;
  const trimmed = typeof appName === "string" ? appName.trim() : "";
  if (
    !trimmed ||
    trimmed.length > APP_NAME_MAX_LENGTH ||
    !APP_NAME_PATTERN.test(trimmed)
  ) {
    throw new ValidationError(
      `appName must be 1-${APP_NAME_MAX_LENGTH} printable ASCII characters, e.g. "my-bot/1.2"`,
    );
  }
  return trimmed;
}

/** `elfa-sdk-js/<version>`, followed by the integrator's `appName` if set. */
export function userAgent(appName?: string): string {
  const app = normalizeAppName(appName);
  return app ? `${SDK_PRODUCT}/${VERSION} ${app}` : `${SDK_PRODUCT}/${VERSION}`;
}

/**
 * The SDK's `User-Agent` as a header object to spread before caller headers,
 * or nothing when the caller already sets one in any casing. `appName` is
 * validated either way, so a bad value never passes silently. Checking the
 * casing matters on the `fetch` paths: a plain object holding both
 * `User-Agent` and `user-agent` is sent as one comma-joined value.
 */
export function userAgentHeader(
  headers: Record<string, string> | undefined,
  appName?: string,
): Record<string, string> {
  const value = userAgent(appName);
  const callerSetsOne = Object.keys(headers ?? {}).some(
    (name) => name.toLowerCase() === "user-agent",
  );
  return callerSetsOne ? {} : { "User-Agent": value };
}
