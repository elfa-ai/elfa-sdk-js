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
      updateOptions: jest.fn(),
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

  it("applies updateOptions to the http client", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.post.mockResolvedValue({ valid: true });

    client.updateOptions({
      baseUrl: "https://staging.api.elfa.ai",
      debug: true,
    });

    expect(mockHttpClient.updateOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://staging.api.elfa.ai",
        debug: true,
      }),
    );
  });

  it("posts validateQuery", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.post.mockResolvedValue({ valid: true });

    await client.validateQuery(eql);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/v2/auto/queries/validate",
      JSON.stringify(eql),
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

  it("cancels with no body", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.post.mockResolvedValue({});

    await client.cancelQuery("q1");

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/v2/auto/queries/q1/cancel",
      undefined,
    );
  });

  it("sends mutations with the api key alone", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.post.mockResolvedValue({});

    await client.createQuery(eql);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/v2/auto/queries",
      JSON.stringify(eql),
    );
  });

  it("deletes a query", async () => {
    const client = new AutoClient({ apiKey: "k" });
    mockHttpClient.delete.mockResolvedValue({});

    await client.deleteQuery("q1");

    expect(mockHttpClient.delete).toHaveBeenCalledWith("/v2/auto/queries/q1");
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
