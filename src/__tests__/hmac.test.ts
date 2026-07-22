import { createHmac } from "crypto";
import { signRequest } from "../utils/hmac";

describe("signRequest", () => {
  const secret = "test-secret";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("signs timestamp + method + path + body with HMAC-SHA256", () => {
    jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);

    const headers = signRequest(secret, "POST", "/queries", '{"a":1}');

    expect(headers["x-elfa-timestamp"]).toBe("1700000000");

    const expected = createHmac("sha256", secret)
      .update("1700000000POST/queries" + '{"a":1}')
      .digest("hex");
    expect(headers["x-elfa-signature"]).toBe(expected);
  });

  it("uses an empty body string when there is no body", () => {
    jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);

    const headers = signRequest(secret, "DELETE", "/queries/abc", "");

    const expected = createHmac("sha256", secret)
      .update("1700000000DELETE/queries/abc")
      .digest("hex");
    expect(headers["x-elfa-signature"]).toBe(expected);
  });
});
