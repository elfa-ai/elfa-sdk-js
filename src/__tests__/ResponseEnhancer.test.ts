import { ResponseEnhancer } from "../utils/enhancer";
import type { TwitterClient } from "../client/TwitterClient";
import type { ProcessedMention, SimpleMention } from "../types/elfa";

// Mock the TwitterClient
jest.mock("../client/TwitterClient");

describe("ResponseEnhancer", () => {
  let enhancer: ResponseEnhancer;
  let mockTwitterClient: jest.Mocked<TwitterClient>;

  beforeEach(() => {
    mockTwitterClient = {
      getTweets: jest.fn(),
      getTweet: jest.fn(),
      getUser: jest.fn(),
      getUserByUsername: jest.fn(),
      testConnection: jest.fn(),
      getRateLimitInfo: jest.fn(),
    } as any;

    enhancer = new ResponseEnhancer(mockTwitterClient, 50);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("enhanceProcessedMentions", () => {
    const mockMentions: ProcessedMention[] = [
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
        account: {
          isVerified: true,
          username: "testuser",
        },
        repostBreakdown: {
          smart: 3,
          ct: 7,
        },
      },
      {
        tweetId: "987654321",
        link: "https://twitter.com/user/status/987654321",
        likeCount: 15,
        repostCount: 5,
        viewCount: 500,
        quoteCount: 1,
        replyCount: 2,
        bookmarkCount: 1,
        mentionedAt: "2023-01-01T01:00:00Z",
        type: "post",
        account: {
          isVerified: false,
          username: "normaluser",
        },
        repostBreakdown: {
          smart: 2,
          ct: 3,
        },
      },
    ];

    it("should enhance mentions with Twitter data", async () => {
      mockTwitterClient.getTweets.mockResolvedValue({
        data: [
          {
            id: "123456789",
            text: "Bitcoin is going up! 🚀",
            author_id: "user123",
            created_at: "2023-01-01T00:00:00.000Z",
            public_metrics: {
              retweet_count: 10,
              like_count: 20,
              reply_count: 5,
              quote_count: 2,
              impression_count: 1000,
            },
          },
        ],
        includes: {
          users: [
            {
              id: "user123",
              username: "testuser",
              name: "Test User",
              verified: true,
              public_metrics: {
                followers_count: 10000,
                following_count: 500,
                tweet_count: 1000,
                listed_count: 100,
              },
            },
          ],
        },
      });

      const result = await enhancer.enhanceProcessedMentions(mockMentions, {
        includeContent: true,
        includeMetrics: true,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        tweetId: "123456789",
        data_source: "elfa+twitter",
        enhanced_metrics: {
          impression_count: 1000,
          engagement_rate: 37 / 1000,
          reach: 10000,
          twitter_verified: true,
        },
      });
      expect(result.data[1]).toMatchObject({
        tweetId: "987654321",
        data_source: "elfa",
      });
      expect(result.enhancement_info.total_enhanced).toBe(1);
      expect(result.enhancement_info.twitter_api_used).toBe(true);
    });

    it("should return unenhanced data when no Twitter client", async () => {
      const enhancerWithoutTwitter = new ResponseEnhancer();

      const result = await enhancerWithoutTwitter.enhanceProcessedMentions(
        mockMentions,
        {
          includeContent: true,
        },
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0].data_source).toBe("elfa");
      expect(result.data[1].data_source).toBe("elfa");
      expect(result.enhancement_info.total_enhanced).toBe(0);
      expect(result.enhancement_info.twitter_api_used).toBe(false);
    });

    it("should return unenhanced data when includeContent is false", async () => {
      const result = await enhancer.enhanceProcessedMentions(mockMentions, {
        includeContent: false,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].data_source).toBe("elfa");
      expect(result.enhancement_info.twitter_api_used).toBe(false);
    });

    it("should handle Twitter API errors gracefully with fallback", async () => {
      mockTwitterClient.getTweets.mockRejectedValue(
        new Error("Twitter API error"),
      );

      const result = await enhancer.enhanceProcessedMentions(mockMentions, {
        includeContent: true,
        fallbackToV2: true,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].data_source).toBe("elfa");
      expect(result.enhancement_info.total_enhanced).toBe(0);
      expect(result.enhancement_info.failed_enhancements).toBe(2);
      expect(result.enhancement_info.errors).toHaveLength(1);
    });

    it("should throw EnhancementError when fallback is disabled", async () => {
      mockTwitterClient.getTweets.mockRejectedValue(
        new Error("Twitter API error"),
      );

      await expect(
        enhancer.enhanceProcessedMentions(mockMentions, {
          includeContent: true,
          fallbackToV2: false,
        }),
      ).rejects.toThrow("Failed to enhance mentions with Twitter data");
    });

    it("should handle mentions without valid Twitter URLs", async () => {
      const mentionsWithoutTwitterUrls: ProcessedMention[] = [
        {
          tweetId: "123",
          link: "https://example.com/post/123",
          likeCount: 0,
          repostCount: 0,
          viewCount: 0,
          quoteCount: 0,
          replyCount: 0,
          bookmarkCount: 0,
          mentionedAt: "2023-01-01T00:00:00Z",
          type: "post",
          repostBreakdown: {
            smart: 0,
            ct: 0,
          },
        },
      ];

      const result = await enhancer.enhanceProcessedMentions(
        mentionsWithoutTwitterUrls,
        {
          includeContent: true,
        },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].data_source).toBe("elfa");
      expect(result.enhancement_info.total_enhanced).toBe(0);
      expect(result.enhancement_info.twitter_api_used).toBe(false);
    });
  });

  describe("enhanceSimpleMentions", () => {
    const mockSimpleMentions: SimpleMention[] = [
      {
        id: 1,
        twitter_id: "123456789",
        twitter_user_id: "user123",
        parent_tweet_id: "0",
        content: "Bitcoin is going up!",
        mentioned_at: "2023-01-01T00:00:00Z",
        type: "tweet",
        metrics: {
          view_count: 1000,
          repost_count: 10,
          reply_count: 5,
          like_count: 20,
        },
      },
      {
        id: 2,
        twitter_id: "987654321",
        twitter_user_id: "user456",
        parent_tweet_id: "0",
        content: "Ethereum update",
        mentioned_at: "2023-01-01T01:00:00Z",
        type: "tweet",
        metrics: {
          view_count: 500,
          repost_count: 5,
          reply_count: 2,
          like_count: 15,
        },
      },
    ];

    it("should enhance simple mentions with Twitter data", async () => {
      mockTwitterClient.getTweets.mockResolvedValue({
        data: [
          {
            id: "123456789",
            text: "Bitcoin is going up! 🚀",
            author_id: "user123",
            created_at: "2023-01-01T00:00:00.000Z",
            public_metrics: {
              retweet_count: 10,
              like_count: 20,
              reply_count: 5,
              quote_count: 2,
              impression_count: 1000,
            },
          },
        ],
        includes: {
          users: [
            {
              id: "user123",
              username: "testuser",
              name: "Test User",
              verified: false,
              public_metrics: {
                followers_count: 5000,
                following_count: 300,
                tweet_count: 500,
                listed_count: 50,
              },
            },
          ],
        },
      });

      const result = await enhancer.enhanceSimpleMentions(mockSimpleMentions, {
        includeContent: true,
        includeMetrics: true,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: 1,
        content: "Bitcoin is going up! 🚀",
        data_source: "elfa+twitter",
        enhanced_metrics: {
          impression_count: 1000,
          engagement_rate: 37 / 1000,
          reach: 5000,
          twitter_verified: false,
        },
      });
      expect(result.enhancement_info.total_enhanced).toBe(1);
    });
  });

  describe("extractTweetId", () => {
    it("should extract tweet ID from Twitter URL", () => {
      const enhancerInstance = enhancer as any;

      expect(
        enhancerInstance.extractTweetId(
          "https://twitter.com/user/status/123456789",
        ),
      ).toBe("123456789");
      expect(
        enhancerInstance.extractTweetId("https://x.com/user/status/987654321"),
      ).toBe("987654321");
      expect(
        enhancerInstance.extractTweetId("https://example.com/post/123"),
      ).toBeNull();
    });
  });

  describe("calculateEnhancedMetrics", () => {
    it("should calculate enhanced metrics correctly", () => {
      const enhancerInstance = enhancer as any;

      const tweet = {
        id: "123",
        text: "Test tweet",
        public_metrics: {
          retweet_count: 10,
          like_count: 20,
          reply_count: 5,
          quote_count: 2,
          impression_count: 1000,
        },
      };

      const user = {
        id: "user123",
        username: "testuser",
        verified: true,
        verified_type: "blue",
        public_metrics: {
          followers_count: 10000,
          following_count: 500,
          tweet_count: 1000,
          listed_count: 100,
        },
      };

      const metrics = enhancerInstance.calculateEnhancedMetrics(tweet, user);

      expect(metrics).toEqual({
        impression_count: 1000,
        engagement_rate: 37 / 1000,
        reach: 10000,
        twitter_verified: true,
      });
    });

    it("should handle missing metrics gracefully", () => {
      const enhancerInstance = enhancer as any;

      const tweet = { id: "123", text: "Test tweet" };
      const user = { id: "user123", username: "testuser" };

      const metrics = enhancerInstance.calculateEnhancedMetrics(tweet, user);

      expect(metrics).toEqual({
        reach: undefined,
        twitter_verified: false,
      });
    });
  });
});
