import { readFileSync } from "fs";
import { join } from "path";
import { VERSION } from "../version";

describe("VERSION", () => {
  it("matches package.json, so the User-Agent never reports a stale version", () => {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, "../../package.json"), "utf8"),
    ) as { version: string };

    expect(VERSION).toBe(pkg.version);
  });
});
