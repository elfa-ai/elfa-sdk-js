import { AutoClient } from "../client/AutoClient";
import { HttpClient } from "../utils/http";

jest.mock("../utils/http");

describe("AutoClient", () => {
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      setAuthHeader: jest.fn(),
    } as any;
    (HttpClient as jest.MockedClass<typeof HttpClient>).mockImplementation(
      () => mockHttpClient,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const eql = {
    query: {
      conditions: { AND: [] },
      actions: [{ stepId: "s1", type: "notify" as const, params: {} }],
      expiresIn: "1h",
    },
  };

  it("posts validateQuery unsigned", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.post.mockResolvedValue({ valid: true });

    await client.validateQuery(eql);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/v2/auto/queries/validate",
      JSON.stringify(eql),
      undefined,
    );
  });

  it("builds list query params", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.get.mockResolvedValue({ queries: [] });

    await client.listQueries({ limit: 3, status: "active" });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "/v2/auto/queries?limit=3&status=active",
    );
  });

  it("gets a query by id", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.get.mockResolvedValue({});

    await client.getQuery("q1");

    expect(mockHttpClient.get).toHaveBeenCalledWith("/v2/auto/queries/q1");
  });

  it("cancels with no body and no signature when unsigned", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.post.mockResolvedValue({});

    await client.cancelQuery("q1");

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/v2/auto/queries/q1/cancel",
      undefined,
      undefined,
    );
  });

  it("signs mutations when hmacSecret is set", async () => {
    const client = new AutoClient({ apiKey: "k", hmacSecret: "secret" });
    mockHttpClient.post.mockResolvedValue({});

    await client.createQuery(eql);

    const [url, body, config] = mockHttpClient.post.mock.calls[0];
    expect(url).toBe("/v2/auto/queries");
    expect(body).toBe(JSON.stringify(eql));
    expect(config?.headers).toEqual(
      expect.objectContaining({
        "x-elfa-timestamp": expect.any(String),
        "x-elfa-signature": expect.any(String),
      }),
    );
  });

  it("deletes a query", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.delete.mockResolvedValue({});

    await client.deleteQuery("q1");

    expect(mockHttpClient.delete).toHaveBeenCalledWith(
      "/v2/auto/queries/q1",
      undefined,
    );
  });

  it("validates a symbol with encoded path", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.get.mockResolvedValue({ supported: "true" });

    await client.validateSymbol("hyperliquid", "BTC");

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "/v2/auto/validate-symbol/hyperliquid/BTC",
    );
  });
});
