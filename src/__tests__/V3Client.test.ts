import { V3Client } from "../client/V3Client";
import { HttpClient } from "../utils/http";
import { ElfaApiError } from "../utils/errors";

jest.mock("../utils/http");

describe("V3Client", () => {
  let mockHttpClient: jest.Mocked<HttpClient>;
  let client: V3Client;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      setAuthHeader: jest.fn(),
      updateOptions: jest.fn(),
    } as any;
    (HttpClient as jest.MockedClass<typeof HttpClient>).mockImplementation(
      () => mockHttpClient,
    );
    client = new V3Client({ apiKey: "k" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const ID1 = "b23e0b47-deec-4161-b49c-7e2652f07fe6";
  const ID2 = "0fdfbd36-2ec0-4e72-a074-50c6df7e3e20";
  const page = { nextCursor: "c2", hasMore: true, servedFrom: 1790672305 };

  it("authenticates with the api key on the shared http client", () => {
    expect(HttpClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "https://api.elfa.ai" }),
    );
    expect(mockHttpClient.setAuthHeader).toHaveBeenCalledWith("k");
  });

  it("applies updateOptions to the http client", () => {
    client.updateOptions({ baseUrl: "https://example.test", debug: true });

    expect(mockHttpClient.updateOptions).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "https://example.test", debug: true }),
    );
  });

  it("resolves entities with a comma-joined entityType", async () => {
    const response = {
      entities: [{ id: ID1, name: "Bitcoin" }],
      nextCursor: null,
      hasMore: false,
    };
    mockHttpClient.get.mockResolvedValue(response);

    const result = await client.getEntities({
      q: "btc",
      entityType: ["token", "equity"],
      limit: 1,
    });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "/v3/entities?q=btc&entityType=token%2Cequity&limit=1",
    );
    expect(result.entities[0].name).toBe("Bitcoin");
  });

  it("lists events with comma-joined ids and string booleans", async () => {
    mockHttpClient.get.mockResolvedValue({ events: [], ...page });

    const result = await client.getEvents({
      from: 1790672305,
      entityIds: [ID1, ID2],
      alertAction: ["alert", "monitor"],
      hasStoryline: true,
      notable: false,
      limit: 10,
      cursor: "c1",
    });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      `/v3/events?from=1790672305&entityIds=${ID1}%2C${ID2}&alertAction=alert%2Cmonitor&hasStoryline=true&notable=false&limit=10&cursor=c1`,
    );
    expect(result).toEqual({ events: [], ...page });
  });

  it("sends no query string when no params are set", async () => {
    mockHttpClient.get.mockResolvedValue({ events: [], ...page });

    await client.getEvents();

    expect(mockHttpClient.get).toHaveBeenCalledWith("/v3/events");
  });

  it("drops undeclared and empty params", async () => {
    mockHttpClient.get.mockResolvedValue({ events: [], ...page });

    await client.getEvents({
      eventIds: [ID1],
      entityIds: [],
      timeWindow: "24h",
    } as any);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      `/v3/events?eventIds=${ID1}`,
    );
  });

  it("lists storylines", async () => {
    mockHttpClient.get.mockResolvedValue({ storylines: [], ...page });

    await client.getStorylines({
      q: "hack",
      status: "any",
      relation: ["origin", "update"],
    });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "/v3/events/storylines?q=hack&status=any&relation=origin%2Cupdate",
    );
  });

  it("lists arcs without a range", async () => {
    mockHttpClient.get.mockResolvedValue({
      arcs: [],
      nextCursor: null,
      hasMore: false,
    });

    await client.getArcs({
      assetClass: "crypto",
      sort: "events",
      from: 1,
    } as any);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "/v3/events/arcs?assetClass=crypto&sort=events",
    );
  });

  it.each(["crypto", "equity"] as const)(
    "maps the %s market onto the call book path",
    async (market) => {
      mockHttpClient.get.mockResolvedValue({ bars: [], ...page });

      await client.getCallBook(market, { from: 1790845105, limit: 2 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/v3/market/${market}/call-book?from=1790845105&limit=2`,
      );
    },
  );

  it.each(["crypto", "equity"] as const)(
    "maps the %s market onto the mindshare path",
    async (market) => {
      mockHttpClient.get.mockResolvedValue({
        assets: [],
        nextCursor: null,
        hasMore: false,
      });

      await client.getMindshare(market, { period: "24h", to: 1790931300 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/v3/market/${market}/mindshare?period=24h&to=1790931300`,
      );
    },
  );

  it("reads mindshare with no params", async () => {
    mockHttpClient.get.mockResolvedValue({
      assets: [],
      nextCursor: null,
      hasMore: false,
    });

    await client.getMindshare("crypto");

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "/v3/market/crypto/mindshare",
    );
  });

  it("lists trending contracts", async () => {
    mockHttpClient.get.mockResolvedValue({ contracts: [], ...page });

    await client.getTrendingContracts({ from: 1790845105, minMentions: 10 });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "/v3/market/crypto/trending-contracts?from=1790845105&minMentions=10",
    );
  });

  it("lists calls by id", async () => {
    mockHttpClient.get.mockResolvedValue({ calls: [], ...page });

    await client.getCalls({ callIds: [ID1, ID2], handle: "3PeaksTrading" });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      `/v3/calls?callIds=${ID1}%2C${ID2}&handle=3PeaksTrading`,
    );
  });

  it("lists call episodes", async () => {
    mockHttpClient.get.mockResolvedValue({ episodes: [], ...page });

    await client.getCallEpisodes({
      from: 1790845105,
      entityIds: [ID1],
      status: "open",
      direction: "long",
      assetClass: "crypto",
      order: "asc",
    });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      `/v3/calls/episodes?from=1790845105&entityIds=${ID1}&status=open&direction=long&assetClass=crypto&order=asc`,
    );
  });

  it("reads positioning for one entity", async () => {
    const response = {
      id: ID1,
      symbol: "BTC",
      name: "Bitcoin",
      openLong: 3252,
      openShort: 402,
      asOf: 1790931501,
    };
    mockHttpClient.get.mockResolvedValue(response);

    const result = await client.getPositioning({ entityId: ID1 });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      `/v3/calls/positioning?entityId=${ID1}`,
    );
    expect(result).toEqual(response);
  });

  it("lists top accounts", async () => {
    mockHttpClient.get.mockResolvedValue({
      accounts: [],
      nextCursor: null,
      hasMore: false,
    });

    await client.getTopAccounts({ metric: "standing", limit: 3 });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "/v3/people/accounts?metric=standing&limit=3",
    );
  });

  it("reads key status with no params", async () => {
    const response = {
      plan: "grow",
      billingMode: "arrears",
      owner: "user",
      scopes: ["key-status"],
      credits: {
        limit: 1000,
        used: 1,
        remaining: 999,
        resetsAt: 1793491200,
        requestsPerMinute: 60,
      },
      historyFrom: 1788307200,
    };
    mockHttpClient.get.mockResolvedValue(response);

    const result = await client.getKeyStatus();

    expect(mockHttpClient.get).toHaveBeenCalledWith("/v3/key-status");
    expect(result.historyFrom).toBe(1788307200);
  });

  it("propagates API errors", async () => {
    const body = {
      code: "ERR_INVALID_PARAMETER",
      message: "from is required",
      errorId: "8d935689",
      requestId: "4b181263",
    };
    mockHttpClient.get.mockRejectedValue(
      new ElfaApiError(body.message, 400, body),
    );

    await expect(client.getCalls()).rejects.toMatchObject({
      name: "ElfaApiError",
      statusCode: 400,
      details: body,
    });
  });
});
