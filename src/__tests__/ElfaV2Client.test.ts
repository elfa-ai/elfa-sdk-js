import { ElfaV2Client } from "../client/ElfaV2Client";
import { HttpClient } from "../utils/http";
import { ValidationError } from "../utils/errors";

// Mock the HttpClient
jest.mock("../utils/http");

describe("ElfaV2Client", () => {
  let client: ElfaV2Client;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      setAuthHeader: jest.fn(),
      setTwitterAuthHeader: jest.fn(),
      request: jest.fn(),
    } as any;

    (HttpClient as jest.MockedClass<typeof HttpClient>).mockImplementation(
      () => mockHttpClient,
    );

    client = new ElfaV2Client({
      apiKey: "test-api-key",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create client with default options", () => {
      expect(HttpClient).toHaveBeenCalledWith({
        baseURL: "https://api.elfa.ai",
        timeout: 30000,
        retries: 3,
        debug: false,
      });
      expect(mockHttpClient.setAuthHeader).toHaveBeenCalledWith("test-api-key");
    });

    it("should create client with custom options", () => {
      new ElfaV2Client({
        apiKey: "test-key",
        baseUrl: "https://custom.api.com",
        timeout: 5000,
        retries: 1,
        debug: true,
      });

      expect(HttpClient).toHaveBeenCalledWith({
        baseURL: "https://custom.api.com",
        timeout: 5000,
        retries: 1,
        debug: true,
      });
    });
  });

  describe("ping", () => {
    it("should call ping endpoint", async () => {
      const mockResponse = { success: true, data: { message: "pong" } };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.ping();

      expect(mockHttpClient.get).toHaveBeenCalledWith("/v2/ping");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getApiKeyStatus", () => {
    it("should call key-status endpoint", async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          key: "test-key",
          status: "active",
          usage: {},
        },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getApiKeyStatus();

      expect(mockHttpClient.get).toHaveBeenCalledWith("/v2/key-status");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getTrendingTokens", () => {
    it("should call trending tokens endpoint with timeWindow", async () => {
      const mockResponse = {
        success: true,
        data: { total: 5, page: 1, pageSize: 10, data: [] },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTrendingTokens({
        timeWindow: "24h",
        page: 1,
        pageSize: 10,
        minMentions: 5,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/aggregations/trending-tokens?timeWindow=24h&page=1&pageSize=10&minMentions=5",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should call trending tokens endpoint with from/to parameters", async () => {
      const mockResponse = {
        success: true,
        data: { total: 5, page: 1, pageSize: 10, data: [] },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTrendingTokens({
        from: 1640995200,
        to: 1641081600,
        page: 1,
        pageSize: 10,
        minMentions: 5,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/aggregations/trending-tokens?from=1640995200&to=1641081600&page=1&pageSize=10&minMentions=5",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw ValidationError when no time parameters are provided", async () => {
      await expect(
        client.getTrendingTokens({
          page: 1,
          pageSize: 10,
        }),
      ).rejects.toThrow(
        new ValidationError(
          "You must provide either timeWindow or both from and to parameters",
        ),
      );
    });

    it("should throw ValidationError when only from is provided", async () => {
      await expect(
        client.getTrendingTokens({
          from: 1640995200,
          page: 1,
        }),
      ).rejects.toThrow(
        new ValidationError(
          "When using from/to parameters, both from and to must be provided",
        ),
      );
    });

    it("should throw ValidationError when only to is provided", async () => {
      await expect(
        client.getTrendingTokens({
          to: 1641081600,
          page: 1,
        }),
      ).rejects.toThrow(
        new ValidationError(
          "When using from/to parameters, both from and to must be provided",
        ),
      );
    });

    it("should allow both timeWindow and from/to (from/to takes priority)", async () => {
      const mockResponse = {
        success: true,
        data: { total: 5, page: 1, pageSize: 10, data: [] },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTrendingTokens({
        timeWindow: "24h",
        from: 1640995200,
        to: 1641081600,
        page: 1,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/aggregations/trending-tokens?timeWindow=24h&from=1640995200&to=1641081600&page=1",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAccountSmartStats", () => {
    it("should call account smart stats endpoint", async () => {
      const mockResponse = {
        success: true,
        data: {
          smartFollowingCount: 10,
          averageEngagement: 0.5,
          followerEngagementRatio: 100,
        },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getAccountSmartStats({
        username: "testuser",
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/account/smart-stats?username=testuser",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw ValidationError if username is missing", async () => {
      await expect(client.getAccountSmartStats({} as any)).rejects.toThrow(
        new ValidationError("Username is required"),
      );
    });
  });

  describe("getKeywordMentions", () => {
    it("should call keyword mentions endpoint with keywords", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getKeywordMentions({
        keywords: "bitcoin",
        timeWindow: "24h",
        limit: 10,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/keyword-mentions?keywords=bitcoin&timeWindow=24h&limit=10",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should call keyword mentions endpoint with reposts parameter", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getKeywordMentions({
        keywords: "bitcoin",
        timeWindow: "24h",
        limit: 10,
        reposts: false,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/keyword-mentions?keywords=bitcoin&timeWindow=24h&limit=10&reposts=false",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should call keyword mentions endpoint with accountName", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getKeywordMentions({
        accountName: "testuser",
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/keyword-mentions?accountName=testuser",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw ValidationError if both keywords and accountName are missing", async () => {
      await expect(client.getKeywordMentions({})).rejects.toThrow(
        new ValidationError("Either keywords or accountName must be provided"),
      );
    });
  });

  describe("getTokenNews", () => {
    it("should call token news endpoint with default params", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0, page: 1, pageSize: 20 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTokenNews();

      expect(mockHttpClient.get).toHaveBeenCalledWith("/v2/data/token-news");
      expect(result).toEqual(mockResponse);
    });

    it("should call token news endpoint with params", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0, page: 1, pageSize: 10 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTokenNews({
        from: 1640995200,
        to: 1641081600,
        page: 1,
        pageSize: 10,
        coinIds: "bitcoin,ethereum",
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/token-news?from=1640995200&to=1641081600&page=1&pageSize=10&coinIds=bitcoin%2Cethereum",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should call token news endpoint with reposts parameter", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0, page: 1, pageSize: 10 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTokenNews({
        from: 1640995200,
        to: 1641081600,
        page: 1,
        pageSize: 10,
        coinIds: "bitcoin,ethereum",
        reposts: false,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/token-news?from=1640995200&to=1641081600&page=1&pageSize=10&coinIds=bitcoin%2Cethereum&reposts=false",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getTrendingCAsTwitter", () => {
    it("should call trending CAs Twitter endpoint", async () => {
      const mockResponse = {
        success: true,
        data: { data: [], total: 0, page: 1, pageSize: 20 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTrendingCAsTwitter({
        timeWindow: "24h",
        pageSize: 10,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/aggregations/trending-cas/twitter?timeWindow=24h&pageSize=10",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getTrendingCAsTelegram", () => {
    it("should call trending CAs Telegram endpoint", async () => {
      const mockResponse = {
        success: true,
        data: { data: [], total: 0, page: 1, pageSize: 20 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTrendingCAsTelegram({
        timeWindow: "24h",
        pageSize: 10,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/aggregations/trending-cas/telegram?timeWindow=24h&pageSize=10",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getV1TopMentions", () => {
    it("should call V1 top mentions endpoint", async () => {
      const mockResponse = {
        success: true,
        data: { data: [], total: 0, page: 1, pageSize: 20 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getV1TopMentions({
        ticker: "BTC",
        timeWindow: "24h",
        includeAccountDetails: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/top-mentions?ticker=BTC&timeWindow=24h",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw ValidationError if ticker is missing", async () => {
      await expect(client.getV1TopMentions({} as any)).rejects.toThrow(
        new ValidationError("Ticker is required"),
      );
    });
  });

  describe("getMentionsByKeywords", () => {
    it("should call mentions by keywords endpoint", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getMentionsByKeywords({
        keywords: "bitcoin",
        from: 1640995200,
        to: 1641081600,
        limit: 10,
        searchType: "and",
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/keyword-mentions?keywords=bitcoin&from=1640995200&to=1641081600&limit=10&searchType=and",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should call mentions by keywords endpoint with reposts parameter", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getMentionsByKeywords({
        keywords: "bitcoin",
        from: 1640995200,
        to: 1641081600,
        limit: 10,
        reposts: false,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/keyword-mentions?keywords=bitcoin&from=1640995200&to=1641081600&limit=10&reposts=false",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw ValidationError if keywords are missing", async () => {
      await expect(
        client.getMentionsByKeywords({
          from: 1640995200,
          to: 1641081600,
        } as any),
      ).rejects.toThrow(new ValidationError("Keywords are required"));
    });

    it("should throw ValidationError if from/to timestamps are missing", async () => {
      await expect(
        client.getMentionsByKeywords({
          keywords: "bitcoin",
        } as any),
      ).rejects.toThrow(
        new ValidationError("Both from and to timestamps are required"),
      );
    });
  });

  describe("getTopMentions", () => {
    it("should call top mentions V2 endpoint with timeWindow", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0, page: 1, pageSize: 10 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTopMentions({
        ticker: "BTC",
        timeWindow: "24h",
        page: 1,
        pageSize: 10,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/top-mentions?ticker=BTC&timeWindow=24h&page=1&pageSize=10",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should call top mentions V2 endpoint with from/to timestamps", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0, page: 1, pageSize: 10 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTopMentions({
        ticker: "ETH",
        from: 1640995200,
        to: 1641081600,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/top-mentions?ticker=ETH&from=1640995200&to=1641081600",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should call top mentions V2 endpoint with reposts parameter", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0, page: 1, pageSize: 10 },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTopMentions({
        ticker: "BTC",
        timeWindow: "24h",
        page: 1,
        pageSize: 10,
        reposts: false,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/v2/data/top-mentions?ticker=BTC&timeWindow=24h&page=1&pageSize=10&reposts=false",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw ValidationError if ticker is missing", async () => {
      await expect(client.getTopMentions({} as any)).rejects.toThrow(
        new ValidationError("Ticker is required"),
      );
    });
  });

  describe("testConnection", () => {
    it("should return true when ping succeeds", async () => {
      mockHttpClient.get.mockResolvedValue({ success: true });

      const result = await client.testConnection();

      expect(result).toBe(true);
    });

    it("should return false when ping fails", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Network error"));

      const result = await client.testConnection();

      expect(result).toBe(false);
    });

    it("should return false when ping returns success: false", async () => {
      mockHttpClient.get.mockResolvedValue({ success: false });

      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });
});
