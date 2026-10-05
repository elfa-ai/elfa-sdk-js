import http from "http";
import type { AddressInfo } from "net";
import { HttpClient } from "../utils/http";
import { VERSION } from "../version";

describe("User-Agent on the wire (real axios)", () => {
  let server: http.Server;
  let baseURL: string;
  const seen: (string | string[] | undefined)[] = [];

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      seen.push(req.headers["user-agent"]);
      res.setHeader("content-type", "application/json");
      res.end("{}");
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  beforeEach(() => {
    seen.length = 0;
  });

  it("sends the SDK User-Agent with the appName", async () => {
    const client = new HttpClient({ baseURL, appName: "my-bot/1.2" });

    await client.get("/x");

    expect(seen).toEqual([`elfa-sdk-js/${VERSION} my-bot/1.2`]);
  });

  it("sends a User-Agent supplied later through updateOptions", async () => {
    const client = new HttpClient({ baseURL, appName: "my-bot/1.2" });

    client.updateOptions({ headers: { "user-agent": "upd/1" } });
    await client.get("/x");

    expect(seen).toEqual(["upd/1"]);
  });
});
