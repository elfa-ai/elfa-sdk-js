import { ElfaSDK } from "../client/ElfaSDK";
import { ElfaV2Client } from "../client/ElfaV2Client";
import { TwitterClient } from "../client/TwitterClient";
import { ResponseEnhancer } from "../utils/enhancer";

// Mock the dependencies
jest.mock("../client/ElfaV2Client");
jest.mock("../client/TwitterClient");
jest.mock("../utils/enhancer");

describe("ElfaSDK", () => {
  let mockElfaClient: jest.Mocked<ElfaV2Client>;
  let mockTwitterClient: jest.Mocked<TwitterClient>;
  let mockEnhancer: jest.Mocked<ResponseEnhancer>;

  beforeEach(() => {
    mockElfaClient = {
      ping: jest.fn(),
      getApiKeyStatus: jest.fn(),
      getTrendingTokens: jest.fn(),
      getAccountSmartStats: jest.fn(),
      getKeywordMentions: jest.fn(),
      getTokenNews: jest.fn(),
      getTrendingCAsTwitter: jest.fn(),
      getTrendingCAsTelegram: jest.fn(),
      getTopMentions: jest.fn(),
      getV1TopMentions: jest.fn(),
      getMentionsByKeywords: jest.fn(),
      getMentions: jest.fn(),
      testConnection: jest.fn(),
    } as any;

    mockTwitterClient = {
      testConnection: jest.fn(),
    } as any;

    mockEnhancer = {
      enhanceProcessedMentions: jest.fn(),
      enhanceSimpleMentions: jest.fn(),
      enhanceMentionsWithAccountAndToken: jest.fn(),
    } as any;

    (ElfaV2Client as jest.MockedClass<typeof ElfaV2Client>).mockImplementation(
      () => mockElfaClient,
    );
    (
      TwitterClient as jest.MockedClass<typeof TwitterClient>
    ).mockImplementation(() => mockTwitterClient);
    (
      ResponseEnhancer as jest.MockedClass<typeof ResponseEnhancer>
    ).mockImplementation(() => mockEnhancer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create SDK instance with valid options", () => {
      const sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
      });

      expect(sdk).toBeInstanceOf(ElfaSDK);
      expect(sdk.isTwitterEnabled()).toBe(false);
      expect(ElfaV2Client).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        baseUrl: "https://api.elfa.ai",
        timeout: 30000,
        debug: false,
      });
    });

    it("should create SDK instance with Twitter API key", () => {
      const sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
        twitterApiKey: "test-twitter-key",
      });

      expect(sdk).toBeInstanceOf(ElfaSDK);
      expect(sdk.isTwitterEnabled()).toBe(true);
      expect(TwitterClient).toHaveBeenCalledWith({
        bearerToken: "test-twitter-key",
        timeout: 30000,
      });
    });

    it("should create SDK instance with custom options", () => {
      new ElfaSDK({
        elfaApiKey: "test-api-key",
        baseUrl: "https://custom.api.com",
        fetchRawTweets: true,
        enhancementTimeout: 10000,
        maxBatchSize: 50,
        debug: true,
      });

      expect(ElfaV2Client).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        baseUrl: "https://custom.api.com",
        timeout: 10000,
        debug: true,
      });
      expect(ResponseEnhancer).toHaveBeenCalledWith(undefined, 50);
    });

    it("should throw ValidationError for missing elfaApiKey", () => {
      expect(() => {
        new ElfaSDK({} as any);
      }).toThrow("elfaApiKey is required");
    });

    it("should throw ValidationError for invalid maxBatchSize", () => {
      expect(() => {
        new ElfaSDK({
          elfaApiKey: "test-api-key",
          maxBatchSize: 0,
        });
      }).toThrow("maxBatchSize must be between 1 and 100");

      expect(() => {
        new ElfaSDK({
          elfaApiKey: "test-api-key",
          maxBatchSize: 101,
        });
      }).toThrow("maxBatchSize must be between 1 and 100");
    });

    it("should throw ValidationError for invalid enhancementTimeout", () => {
      expect(() => {
        new ElfaSDK({
          elfaApiKey: "test-api-key",
          enhancementTimeout: 500,
        });
      }).toThrow("enhancementTimeout must be at least 1000ms");
    });
  });

  describe("basic API methods", () => {
    let sdk: ElfaSDK;

    beforeEach(() => {
      sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
      });
    });

    it("should call ping", async () => {
      const mockResponse = {
        success: true as const,
        data: { message: "pong" },
      };
      mockElfaClient.ping.mockResolvedValue(mockResponse);

      const result = await sdk.ping();

      expect(mockElfaClient.ping).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it("should call getApiKeyStatus", async () => {
      const mockResponse = {
        success: true as const,
        data: {
          id: 1,
          name: "test-key",
          status: "active" as const,
          dailyRequestLimit: 1000,
          monthlyRequestLimit: 10000,
          expiresAt: "2024-12-31T23:59:59Z",
          createdAt: "2024-01-01T00:00:00Z",
          usage: { monthly: 100, daily: 10 },
          limits: { monthly: 10000, daily: 1000 },
          isExpired: false,
          remainingRequests: { monthly: 9900, daily: 990 },
        },
      };
      mockElfaClient.getApiKeyStatus.mockResolvedValue(mockResponse);

      const result = await sdk.getApiKeyStatus();

      expect(mockElfaClient.getApiKeyStatus).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it("should call getTrendingTokens with parameters", async () => {
      const mockResponse = {
        success: true,
        data: { data: [], total: 0, page: 1, pageSize: 10 },
      };
      mockElfaClient.getTrendingTokens.mockResolvedValue(mockResponse);

      const result = await sdk.getTrendingTokens({
        timeWindow: "24h",
        page: 1,
        pageSize: 10,
      });

      expect(mockElfaClient.getTrendingTokens).toHaveBeenCalledWith({
        timeWindow: "24h",
        page: 1,
        pageSize: 10,
      });
      expect(result).toBe(mockResponse);
    });

    it("should call getAccountSmartStats", async () => {
      const mockResponse = {
        success: true as const,
        data: {
          smartFollowingCount: 10,
          averageEngagement: 0.5,
          averageReach: 100,
          smartFollowerCount: 15,
          followerCount: 1000,
        },
      };
      mockElfaClient.getAccountSmartStats.mockResolvedValue(mockResponse);

      const result = await sdk.getAccountSmartStats({
        username: "testuser",
      });

      expect(mockElfaClient.getAccountSmartStats).toHaveBeenCalledWith({
        username: "testuser",
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe("enhancement functionality", () => {
    let sdk: ElfaSDK;

    beforeEach(() => {
      sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
        twitterApiKey: "test-twitter-key",
      });
    });

    it("should enhance keyword mentions when fetchRawTweets is true", async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            tweetId: "123456789",
            link: "https://twitter.com/user/status/123456789",
            likeCount: 20,
            repostCount: 10,
            viewCount: 1000,
            quoteCount: 2,
            replyCount: 5,
            bookmarkCount: 3,
            mentionedAt: "2023-01-01T00:00:00Z",
            type: "post",
            repostBreakdown: {
              smart: 3,
              ct: 7,
            },
          },
        ],
        metadata: { total: 1 },
      };
      const enhancedResponse = {
        data: [
          {
            tweetId: "123456789",
            link: "https://twitter.com/user/status/123456789",
            likeCount: 20,
            repostCount: 10,
            viewCount: 1000,
            quoteCount: 2,
            replyCount: 5,
            bookmarkCount: 3,
            mentionedAt: "2023-01-01T00:00:00Z",
            type: "post",
            repostBreakdown: {
              smart: 3,
              ct: 7,
            },
            content: "Enhanced content",
            data_source: "elfa+twitter" as const,
          },
        ],
        enhancement_info: {
          total_enhanced: 1,
          failed_enhancements: 0,
          twitter_api_used: true,
        },
      };

      mockElfaClient.getKeywordMentions.mockResolvedValue(mockResponse);
      mockEnhancer.enhanceProcessedMentions.mockResolvedValue(enhancedResponse);

      const result = await sdk.getKeywordMentions({
        keywords: "bitcoin",
        fetchRawTweets: true,
      });

      expect(mockElfaClient.getKeywordMentions).toHaveBeenCalledWith({
        keywords: "bitcoin",
        fetchRawTweets: true,
      });
      expect(mockEnhancer.enhanceProcessedMentions).toHaveBeenCalledWith(
        mockResponse.data,
        {
          includeContent: true,
          includeMetrics: true,
          fallbackToV2: true,
          batchSize: 100,
          timeout: 30000,
        },
      );
      expect((result as any).enhancement_info).toBeDefined();
    });

    it("should not enhance when fetchRawTweets is false", async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            tweetId: "123456789",
            link: "https://twitter.com/user/status/123456789",
            likeCount: 20,
            repostCount: 10,
            viewCount: 1000,
            quoteCount: 2,
            replyCount: 5,
            bookmarkCount: 3,
            mentionedAt: "2023-01-01T00:00:00Z",
            type: "post",
            repostBreakdown: {
              smart: 3,
              ct: 7,
            },
          },
        ],
        metadata: { total: 1 },
      };

      mockElfaClient.getKeywordMentions.mockResolvedValue(mockResponse);

      const result = await sdk.getKeywordMentions({
        keywords: "bitcoin",
        fetchRawTweets: false,
      });

      expect(mockEnhancer.enhanceProcessedMentions).not.toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it("should not enhance when Twitter client is not available", async () => {
      const sdkWithoutTwitter = new ElfaSDK({
        elfaApiKey: "test-api-key",
      });

      const mockResponse = {
        success: true,
        data: [
          {
            tweetId: "123456789",
            link: "https://twitter.com/user/status/123456789",
            likeCount: 20,
            repostCount: 10,
            viewCount: 1000,
            quoteCount: 2,
            replyCount: 5,
            bookmarkCount: 3,
            mentionedAt: "2023-01-01T00:00:00Z",
            type: "post",
            repostBreakdown: {
              smart: 3,
              ct: 7,
            },
          },
        ],
        metadata: { total: 1 },
      };

      mockElfaClient.getKeywordMentions.mockResolvedValue(mockResponse);

      const result = await sdkWithoutTwitter.getKeywordMentions({
        keywords: "bitcoin",
        fetchRawTweets: true,
      });

      expect(mockEnhancer.enhanceProcessedMentions).not.toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it("should enhance token news when fetchRawTweets is true", async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            tweetId: "123456789",
            link: "https://twitter.com/user/status/123456789",
            likeCount: 20,
            repostCount: 10,
            viewCount: 1000,
            quoteCount: 2,
            replyCount: 5,
            bookmarkCount: 3,
            mentionedAt: "2023-01-01T00:00:00Z",
            type: "post",
            repostBreakdown: {
              smart: 3,
              ct: 7,
            },
          },
        ],
        metadata: { total: 1, page: 1, pageSize: 20 },
      };
      const enhancedResponse = {
        data: [
          {
            tweetId: "123456789",
            link: "https://twitter.com/user/status/123456789",
            likeCount: 20,
            repostCount: 10,
            viewCount: 1000,
            quoteCount: 2,
            replyCount: 5,
            bookmarkCount: 3,
            mentionedAt: "2023-01-01T00:00:00Z",
            type: "post",
            repostBreakdown: {
              smart: 3,
              ct: 7,
            },
            content: "Enhanced news",
            data_source: "elfa+twitter" as const,
          },
        ],
        enhancement_info: {
          total_enhanced: 1,
          failed_enhancements: 0,
          twitter_api_used: true,
        },
      };

      mockElfaClient.getTokenNews.mockResolvedValue(mockResponse);
      mockEnhancer.enhanceProcessedMentions.mockResolvedValue(enhancedResponse);

      const result = await sdk.getTokenNews({
        fetchRawTweets: true,
      });

      expect(mockEnhancer.enhanceProcessedMentions).toHaveBeenCalled();
      expect((result as any).enhancement_info).toBeDefined();
    });

    it("should enhance mentions by keywords when fetchRawTweets is true", async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            twitter_id: "123",
            twitter_user_id: "user123",
            parent_tweet_id: "0",
            content: "Bitcoin mention",
            mentioned_at: "2023-01-01T00:00:00Z",
            type: "tweet",
            metrics: {
              view_count: 1000,
              repost_count: 10,
              reply_count: 5,
              like_count: 20,
            },
          },
        ],
        metadata: { total: 1 },
      };
      const enhancedResponse = {
        data: [
          {
            id: 1,
            twitter_id: "123",
            twitter_user_id: "user123",
            parent_tweet_id: "0",
            content: "Enhanced mention",
            mentioned_at: "2023-01-01T00:00:00Z",
            type: "tweet",
            metrics: {
              view_count: 1000,
              repost_count: 10,
              reply_count: 5,
              like_count: 20,
            },
            data_source: "elfa+twitter" as const,
          },
        ],
        enhancement_info: {
          total_enhanced: 1,
          failed_enhancements: 0,
          twitter_api_used: true,
        },
      };

      mockElfaClient.getMentionsByKeywords.mockResolvedValue(mockResponse);
      mockEnhancer.enhanceSimpleMentions.mockResolvedValue(enhancedResponse);

      const result = await sdk.getMentionsByKeywords({
        keywords: "bitcoin",
        from: 1640995200,
        to: 1641081600,
        fetchRawTweets: true,
      });

      expect(mockEnhancer.enhanceSimpleMentions).toHaveBeenCalledWith(
        mockResponse.data,
        {
          includeContent: true,
          includeMetrics: true,
          fallbackToV2: true,
          batchSize: 100,
          timeout: 30000,
        },
      );
      expect((result as any).enhancement_info).toBeDefined();
    });
  });

  describe("options management", () => {
    let sdk: ElfaSDK;

    beforeEach(() => {
      sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
        fetchRawTweets: false,
        debug: false,
      });
    });

    it("should return current options", () => {
      const options = sdk.getOptions();

      expect(options.elfaApiKey).toBe("test-api-key");
      expect(options.fetchRawTweets).toBe(false);
      expect(options.debug).toBe(false);
      expect(options.baseUrl).toBe("https://api.elfa.ai");
    });

    it("should update options", () => {
      sdk.updateOptions({
        fetchRawTweets: true,
        debug: true,
      });

      const options = sdk.getOptions();
      expect(options.fetchRawTweets).toBe(true);
      expect(options.debug).toBe(true);
    });

    it("should not allow updating elfaApiKey", () => {
      expect(() => {
        sdk.updateOptions({
          elfaApiKey: "new-key",
        });
      }).toThrow("Cannot update elfaApiKey after initialization");
    });

    it("should not allow updating twitterApiKey", () => {
      expect(() => {
        sdk.updateOptions({
          twitterApiKey: "new-key",
        });
      }).toThrow("Cannot update twitterApiKey after initialization");
    });
  });

  describe("testConnection", () => {
    it("should test both Elfa and Twitter connections when both are available", async () => {
      const sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
        twitterApiKey: "test-twitter-key",
      });

      mockElfaClient.testConnection.mockResolvedValue(true);
      mockTwitterClient.testConnection.mockResolvedValue(true);

      const result = await sdk.testConnection();

      expect(result).toEqual({
        elfa: true,
        twitter: true,
      });
    });

    it("should handle Elfa connection failure", async () => {
      const sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
        twitterApiKey: "test-twitter-key",
      });

      mockElfaClient.testConnection.mockRejectedValue(
        new Error("Connection failed"),
      );
      mockTwitterClient.testConnection.mockResolvedValue(true);

      const result = await sdk.testConnection();

      expect(result).toEqual({
        elfa: false,
        twitter: true,
      });
    });

    it("should handle Twitter connection failure", async () => {
      const sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
        twitterApiKey: "test-twitter-key",
      });

      mockElfaClient.testConnection.mockResolvedValue(true);
      mockTwitterClient.testConnection.mockRejectedValue(
        new Error("Twitter failed"),
      );

      const result = await sdk.testConnection();

      expect(result).toEqual({
        elfa: true,
        twitter: false,
      });
    });

    it("should only test Elfa when Twitter is not enabled", async () => {
      const sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
      });

      mockElfaClient.testConnection.mockResolvedValue(true);

      const result = await sdk.testConnection();

      expect(result).toEqual({
        elfa: true,
      });
      expect(mockTwitterClient.testConnection).not.toHaveBeenCalled();
    });
  });

  describe("non-enhanced methods", () => {
    let sdk: ElfaSDK;

    beforeEach(() => {
      sdk = new ElfaSDK({
        elfaApiKey: "test-api-key",
      });
    });

    it("should call getTrendingCAsTwitter without enhancement", async () => {
      const mockResponse = {
        success: true,
        data: { data: [], total: 0, page: 1, pageSize: 20 },
      };
      mockElfaClient.getTrendingCAsTwitter.mockResolvedValue(mockResponse);

      const result = await sdk.getTrendingCAsTwitter({
        timeWindow: "24h",
      });

      expect(mockElfaClient.getTrendingCAsTwitter).toHaveBeenCalledWith({
        timeWindow: "24h",
      });
      expect(result).toBe(mockResponse);
    });

    it("should call getTrendingCAsTelegram without enhancement", async () => {
      const mockResponse = {
        success: true,
        data: { data: [], total: 0, page: 1, pageSize: 20 },
      };
      mockElfaClient.getTrendingCAsTelegram.mockResolvedValue(mockResponse);

      const result = await sdk.getTrendingCAsTelegram({
        timeWindow: "24h",
      });

      expect(mockElfaClient.getTrendingCAsTelegram).toHaveBeenCalledWith({
        timeWindow: "24h",
      });
      expect(result).toBe(mockResponse);
    });

    it("should call getTopMentions (V1) without enhancement (not implemented yet)", async () => {
      const mockResponse = {
        success: true,
        data: { data: [], total: 0, page: 1, pageSize: 20 },
      };
      mockElfaClient.getV1TopMentions.mockResolvedValue(mockResponse);

      const result = await sdk.getTopMentions({
        ticker: "BTC",
        fetchRawTweets: true,
      });

      expect(mockElfaClient.getV1TopMentions).toHaveBeenCalledWith({
        ticker: "BTC",
        fetchRawTweets: true,
      });
      expect(result).toBe(mockResponse);
    });

    it("should call getTopMentionsV2 without enhancement (not implemented yet)", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0, page: 1, pageSize: 10 },
      };
      mockElfaClient.getTopMentions.mockResolvedValue(mockResponse);

      const result = await sdk.getTopMentionsV2({
        ticker: "BTC",
        fetchRawTweets: true,
      });

      expect(mockElfaClient.getTopMentions).toHaveBeenCalledWith({
        ticker: "BTC",
        fetchRawTweets: true,
      });
      expect(result).toBe(mockResponse);
    });

    it("should call getMentions without enhancement (not implemented yet)", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: {
          offset: 0,
          limit: 10,
          total: 0,
        },
      };
      mockElfaClient.getMentions.mockResolvedValue(mockResponse);

      const result = await sdk.getMentions({
        limit: 10,
        fetchRawTweets: true,
      });

      expect(mockElfaClient.getMentions).toHaveBeenCalledWith({
        limit: 10,
        fetchRawTweets: true,
      });
      expect(result).toBe(mockResponse);
    });
  });
});
