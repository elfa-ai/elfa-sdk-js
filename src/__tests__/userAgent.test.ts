import {
  APP_NAME_MAX_LENGTH,
  normalizeAppName,
  userAgent,
  userAgentHeader,
} from "../utils/userAgent";
import { ValidationError } from "../utils/errors";
import { VERSION } from "../version";

describe("userAgent", () => {
  it("is elfa-sdk-js/<version> without an appName", () => {
    expect(userAgent()).toBe(`elfa-sdk-js/${VERSION}`);
  });

  it("appends the trimmed appName", () => {
    expect(userAgent("  my-bot/1.2 (prod)  ")).toBe(
      `elfa-sdk-js/${VERSION} my-bot/1.2 (prod)`,
    );
  });

  it("accepts an appName of exactly the maximum length", () => {
    const name = "a".repeat(APP_NAME_MAX_LENGTH);
    expect(normalizeAppName(name)).toBe(name);
  });

  it.each([
    ["empty", ""],
    ["whitespace only", "   "],
    ["too long", "a".repeat(APP_NAME_MAX_LENGTH + 1)],
    ["a line break", "bot\r\nx-injected: 1"],
    ["a tab", "bot\t1"],
    ["non-ASCII", "bøt/1"],
  ])("rejects an appName that is %s", (_label, appName) => {
    expect(() => userAgent(appName)).toThrow(ValidationError);
  });
});

describe("userAgentHeader", () => {
  it("returns the SDK User-Agent when the caller sets none", () => {
    expect(userAgentHeader({ "x-custom": "1" }, "my-bot/1.2")).toEqual({
      "User-Agent": `elfa-sdk-js/${VERSION} my-bot/1.2`,
    });
  });

  it.each(["User-Agent", "user-agent", "USER-AGENT"])(
    "returns nothing when the caller sets %s",
    (name) => {
      expect(userAgentHeader({ [name]: "custom/1" })).toEqual({});
    },
  );

  it("still validates appName when the caller sets a User-Agent", () => {
    expect(() =>
      userAgentHeader({ "user-agent": "custom/1" }, "bot\nx"),
    ).toThrow(ValidationError);
  });
});
