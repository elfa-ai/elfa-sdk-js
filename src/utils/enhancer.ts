import type {
  ProcessedMention,
  SimpleMention,
  MentionWithAccountAndToken,
} from "../types/elfa.js";
import type {
  TwitterTweet,
  TwitterUser,
  TwitterApiResponse,
} from "../types/twitter.js";
import type {
  EnhancedProcessedMention,
  EnhancedSimpleMention,
  EnhancedMentionWithAccountAndToken,
  EnhancementOptions,
  EnhancementResult,
  DataSource,
  EnhancedMetrics,
} from "../types/enhanced.js";
import type { TwitterClient } from "../client/TwitterClient.js";
import { EnhancementError } from "./errors.js";

export class ResponseEnhancer {
  private twitterClient?: TwitterClient;
  private batchSize: number;

  constructor(twitterClient?: TwitterClient, batchSize: number = 100) {
    this.twitterClient = twitterClient;
    this.batchSize = batchSize;
  }

  public async enhanceProcessedMentions(
    mentions: ProcessedMention[],
    options: EnhancementOptions = {},
  ): Promise<EnhancementResult<EnhancedProcessedMention[]>> {
    if (!this.twitterClient || !options.includeContent) {
      return {
        data: mentions.map((mention) => ({
          ...mention,
          data_source: "elfa" as DataSource,
        })),
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    const tweetIds = mentions
      .map((mention) => this.extractTweetId(mention.link))
      .filter(Boolean) as string[];

    if (tweetIds.length === 0) {
      return {
        data: mentions.map((mention) => ({
          ...mention,
          data_source: "elfa" as DataSource,
        })),
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    try {
      const twitterData = await this.fetchTwitterData(tweetIds, options);
      const enhanced = this.mergeProcessedMentionsWithTwitterData(
        mentions,
        twitterData,
      );

      return {
        data: enhanced,
        enhancement_info: {
          total_enhanced: enhanced.filter(
            (m) => m.data_source === "elfa+twitter",
          ).length,
          failed_enhancements:
            mentions.length -
            enhanced.filter((m) => m.data_source === "elfa+twitter").length,
          twitter_api_used: true,
        },
      };
    } catch (error) {
      if (options.fallbackToV2 !== false) {
        return {
          data: mentions.map((mention) => ({
            ...mention,
            data_source: "elfa" as DataSource,
          })),
          enhancement_info: {
            total_enhanced: 0,
            failed_enhancements: mentions.length,
            twitter_api_used: false,
            errors: [error instanceof Error ? error.message : "Unknown error"],
          },
        };
      }
      throw new EnhancementError(
        "Failed to enhance mentions with Twitter data",
        error,
      );
    }
  }

  public async enhanceSimpleMentions(
    mentions: SimpleMention[],
    options: EnhancementOptions = {},
  ): Promise<EnhancementResult<EnhancedSimpleMention[]>> {
    if (!this.twitterClient || !options.includeContent) {
      return {
        data: mentions.map((mention) => ({
          ...mention,
          data_source: "elfa" as DataSource,
        })),
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    const tweetIds = mentions.map((mention) => mention.twitter_id);

    try {
      const twitterData = await this.fetchTwitterData(tweetIds, options);
      const enhanced = this.mergeSimpleMentionsWithTwitterData(
        mentions,
        twitterData,
      );

      return {
        data: enhanced,
        enhancement_info: {
          total_enhanced: enhanced.filter(
            (m) => m.data_source === "elfa+twitter",
          ).length,
          failed_enhancements:
            mentions.length -
            enhanced.filter((m) => m.data_source === "elfa+twitter").length,
          twitter_api_used: true,
        },
      };
    } catch (error) {
      if (options.fallbackToV2 !== false) {
        return {
          data: mentions.map((mention) => ({
            ...mention,
            data_source: "elfa" as DataSource,
          })),
          enhancement_info: {
            total_enhanced: 0,
            failed_enhancements: mentions.length,
            twitter_api_used: false,
            errors: [error instanceof Error ? error.message : "Unknown error"],
          },
        };
      }
      throw new EnhancementError(
        "Failed to enhance mentions with Twitter data",
        error,
      );
    }
  }

  public async enhanceMentionsWithAccountAndToken(
    mentions: MentionWithAccountAndToken[],
    options: EnhancementOptions = {},
  ): Promise<EnhancementResult<EnhancedMentionWithAccountAndToken[]>> {
    if (!this.twitterClient || !options.includeContent) {
      return {
        data: mentions.map((mention) => ({
          ...mention,
          data_source: "elfa" as DataSource,
        })),
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    const tweetIds = mentions
      .map((mention) => this.extractTweetId(mention.originalUrl))
      .filter(Boolean) as string[];

    if (tweetIds.length === 0) {
      return {
        data: mentions.map((mention) => ({
          ...mention,
          data_source: "elfa" as DataSource,
        })),
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    try {
      const twitterData = await this.fetchTwitterData(tweetIds, options);
      const enhanced = this.mergeMentionsWithAccountAndTokenWithTwitterData(
        mentions,
        twitterData,
      );

      return {
        data: enhanced,
        enhancement_info: {
          total_enhanced: enhanced.filter(
            (m) => m.data_source === "elfa+twitter",
          ).length,
          failed_enhancements:
            mentions.length -
            enhanced.filter((m) => m.data_source === "elfa+twitter").length,
          twitter_api_used: true,
        },
      };
    } catch (error) {
      if (options.fallbackToV2 !== false) {
        return {
          data: mentions.map((mention) => ({
            ...mention,
            data_source: "elfa" as DataSource,
          })),
          enhancement_info: {
            total_enhanced: 0,
            failed_enhancements: mentions.length,
            twitter_api_used: false,
            errors: [error instanceof Error ? error.message : "Unknown error"],
          },
        };
      }
      throw new EnhancementError(
        "Failed to enhance mentions with Twitter data",
        error,
      );
    }
  }

  private async fetchTwitterData(
    tweetIds: string[],
    options: EnhancementOptions,
  ): Promise<TwitterApiResponse<TwitterTweet[]>> {
    if (!this.twitterClient) {
      throw new Error("Twitter client not available");
    }

    const batchSize = options.batchSize || this.batchSize;
    const allTweets: TwitterTweet[] = [];
    const allUsers: TwitterUser[] = [];

    for (let i = 0; i < tweetIds.length; i += batchSize) {
      const batch = tweetIds.slice(i, i + batchSize);
      const response = await this.twitterClient.getTweets({
        tweetIds: batch,
        tweetFields: [
          "id",
          "text",
          "author_id",
          "created_at",
          "public_metrics",
          "referenced_tweets",
          "context_annotations",
          "lang",
        ],
        userFields: [
          "id",
          "name",
          "username",
          "description",
          "public_metrics",
          "profile_image_url",
          "verified",
          "verified_type",
        ],
        expansions: ["author_id"],
      });

      if (response.data) {
        allTweets.push(...response.data);
      }
      if (response.includes?.users) {
        allUsers.push(...response.includes.users);
      }
    }

    return {
      data: allTweets,
      includes: {
        users: allUsers,
      },
    };
  }

  private mergeProcessedMentionsWithTwitterData(
    mentions: ProcessedMention[],
    twitterData: TwitterApiResponse<TwitterTweet[]>,
  ): EnhancedProcessedMention[] {
    const tweetsMap = new Map<string, TwitterTweet>();
    const usersMap = new Map<string, TwitterUser>();

    twitterData.data?.forEach((tweet) => {
      tweetsMap.set(tweet.id, tweet);
    });

    twitterData.includes?.users?.forEach((user) => {
      usersMap.set(user.id, user);
    });

    return mentions.map((mention) => {
      const tweetId = this.extractTweetId(mention.link);
      const tweet = tweetId ? tweetsMap.get(tweetId) : undefined;
      const user = tweet ? usersMap.get(tweet.author_id) : undefined;

      if (tweet) {
        return {
          ...mention,
          content: tweet.text,
          enhanced_metrics: this.calculateEnhancedMetrics(tweet, user),
          data_source: "elfa+twitter" as DataSource,
          twitter_data: { tweet, user },
        };
      }

      return {
        ...mention,
        data_source: "elfa" as DataSource,
      };
    });
  }

  private mergeSimpleMentionsWithTwitterData(
    mentions: SimpleMention[],
    twitterData: TwitterApiResponse<TwitterTweet[]>,
  ): EnhancedSimpleMention[] {
    const tweetsMap = new Map<string, TwitterTweet>();
    const usersMap = new Map<string, TwitterUser>();

    twitterData.data?.forEach((tweet) => {
      tweetsMap.set(tweet.id, tweet);
    });

    twitterData.includes?.users?.forEach((user) => {
      usersMap.set(user.id, user);
    });

    return mentions.map((mention) => {
      const tweet = tweetsMap.get(mention.twitter_id);
      const user = tweet ? usersMap.get(tweet.author_id) : undefined;

      if (tweet) {
        return {
          ...mention,
          content: tweet.text,
          enhanced_metrics: this.calculateEnhancedMetrics(tweet, user),
          data_source: "elfa+twitter" as DataSource,
          twitter_data: { tweet, user },
        };
      }

      return {
        ...mention,
        data_source: "elfa" as DataSource,
      };
    });
  }

  private mergeMentionsWithAccountAndTokenWithTwitterData(
    mentions: MentionWithAccountAndToken[],
    twitterData: TwitterApiResponse<TwitterTweet[]>,
  ): EnhancedMentionWithAccountAndToken[] {
    const tweetsMap = new Map<string, TwitterTweet>();
    const usersMap = new Map<string, TwitterUser>();

    twitterData.data?.forEach((tweet) => {
      tweetsMap.set(tweet.id, tweet);
    });

    twitterData.includes?.users?.forEach((user) => {
      usersMap.set(user.id, user);
    });

    return mentions.map((mention) => {
      const tweetId = this.extractTweetId(mention.originalUrl);
      const tweet = tweetId ? tweetsMap.get(tweetId) : undefined;
      const user = tweet ? usersMap.get(tweet.author_id) : undefined;

      if (tweet) {
        return {
          ...mention,
          content: tweet.text,
          enhanced_metrics: this.calculateEnhancedMetrics(tweet, user),
          data_source: "elfa+twitter" as DataSource,
          twitter_data: { tweet, user },
        };
      }

      return {
        ...mention,
        data_source: "elfa" as DataSource,
      };
    });
  }

  private extractTweetId(url: string): string | null {
    const tweetIdMatch = url.match(/\/status\/(\d+)/);
    return tweetIdMatch ? tweetIdMatch[1] : null;
  }

  private calculateEnhancedMetrics(
    tweet: TwitterTweet,
    user?: TwitterUser,
  ): EnhancedMetrics {
    const metrics: EnhancedMetrics = {};

    if (tweet.public_metrics) {
      metrics.impression_count = tweet.public_metrics.impression_count;

      const totalEngagements =
        tweet.public_metrics.like_count +
        tweet.public_metrics.retweet_count +
        tweet.public_metrics.reply_count +
        tweet.public_metrics.quote_count;

      if (
        tweet.public_metrics.impression_count &&
        tweet.public_metrics.impression_count > 0
      ) {
        metrics.engagement_rate =
          totalEngagements / tweet.public_metrics.impression_count;
      }
    }

    if (user) {
      metrics.reach = user.public_metrics?.followers_count;
      metrics.twitter_verified =
        user.verified || user.verified_type !== undefined;
    }

    return metrics;
  }

  public async enhanceTopMentionsV2(
    mentions: import("../types/elfa.js").TopMentionV2[],
    options: EnhancementOptions = {},
  ): Promise<
    EnhancementResult<import("../types/enhanced.js").EnhancedTopMentionV2[]>
  > {
    if (!this.twitterClient || !options.includeContent) {
      return {
        data: mentions.map((mention) => ({
          ...mention,
          data_source: "elfa" as DataSource,
        })),
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    const tweetIds = mentions
      .map((mention) => this.extractTweetId(mention.link))
      .filter(Boolean) as string[];

    if (tweetIds.length === 0) {
      return {
        data: mentions.map((mention) => ({
          ...mention,
          data_source: "elfa" as DataSource,
        })),
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    try {
      const twitterData = await this.fetchTwitterData(tweetIds, options);
      const enhanced = this.mergeTopMentionsV2WithTwitterData(
        mentions,
        twitterData,
      );

      return {
        data: enhanced,
        enhancement_info: {
          total_enhanced: enhanced.filter(
            (m) => m.data_source === "elfa+twitter",
          ).length,
          failed_enhancements:
            tweetIds.length -
            enhanced.filter((m) => m.data_source === "elfa+twitter").length,
          twitter_api_used: true,
        },
      };
    } catch (error) {
      if (options.fallbackToV2) {
        return {
          data: mentions.map((mention) => ({
            ...mention,
            data_source: "elfa" as DataSource,
          })),
          enhancement_info: {
            total_enhanced: 0,
            failed_enhancements: mentions.length,
            twitter_api_used: false,
            errors: [(error as Error).message],
          },
        };
      }
      throw new EnhancementError(
        `Failed to enhance TopMentionsV2: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  public async enhanceTopMentionsV1(
    response: import("../types/elfa.js").TopMentionsResponse,
    options: EnhancementOptions = {},
  ): Promise<
    EnhancementResult<
      import("../types/enhanced.js").EnhancedTopMentionsV1Response
    >
  > {
    if (!this.twitterClient || !options.includeContent) {
      // Transform to enhanced format even without Twitter data
      const transformedResponse = this.transformToEnhancedV1Format(
        response,
        "elfa",
      );
      return {
        data: transformedResponse,
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    const mentions = response.data.data;
    const tweetIds = mentions
      .map((mention) => this.extractTweetIdFromV1Mention(mention))
      .filter(Boolean) as string[];

    if (tweetIds.length === 0) {
      const transformedResponse = this.transformToEnhancedV1Format(
        response,
        "elfa",
      );
      return {
        data: transformedResponse,
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false,
        },
      };
    }

    try {
      const twitterData = await this.fetchTwitterData(tweetIds, options);
      const enhancedData = this.mergeTopMentionsV1WithTwitterData(
        response,
        twitterData,
      );

      return {
        data: enhancedData,
        enhancement_info: {
          total_enhanced: enhancedData.data.data.filter(
            (m) => m.data_source === "elfa+twitter",
          ).length,
          failed_enhancements:
            tweetIds.length -
            enhancedData.data.data.filter(
              (m) => m.data_source === "elfa+twitter",
            ).length,
          twitter_api_used: true,
        },
      };
    } catch (error) {
      if (options.fallbackToV2) {
        const transformedResponse = this.transformToEnhancedV1Format(
          response,
          "elfa",
        );
        return {
          data: transformedResponse,
          enhancement_info: {
            total_enhanced: 0,
            failed_enhancements: mentions.length,
            twitter_api_used: false,
            errors: [(error as Error).message],
          },
        };
      }
      throw new EnhancementError(
        `Failed to enhance TopMentionsV1: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  private mergeTopMentionsV2WithTwitterData(
    mentions: import("../types/elfa.js").TopMentionV2[],
    twitterData: TwitterApiResponse<TwitterTweet[]>,
  ): import("../types/enhanced.js").EnhancedTopMentionV2[] {
    const tweetsMap = new Map<string, TwitterTweet>();
    const usersMap = new Map<string, TwitterUser>();

    twitterData.data?.forEach((tweet) => {
      tweetsMap.set(tweet.id, tweet);
    });

    twitterData.includes?.users?.forEach((user) => {
      usersMap.set(user.id, user);
    });

    return mentions.map((mention) => {
      const tweetId = this.extractTweetId(mention.link);
      const tweet = tweetId ? tweetsMap.get(tweetId) : undefined;
      const user = tweet ? usersMap.get(tweet.author_id) : undefined;

      if (tweet) {
        return {
          ...mention,
          content: tweet.text,
          enhanced_metrics: this.calculateEnhancedMetrics(tweet, user),
          data_source: "elfa+twitter" as DataSource,
          twitter_data: { tweet, user },
        };
      }

      return {
        ...mention,
        data_source: "elfa" as DataSource,
      };
    });
  }

  private mergeTopMentionsV1WithTwitterData(
    response: import("../types/elfa.js").TopMentionsResponse,
    twitterData: TwitterApiResponse<TwitterTweet[]>,
  ): import("../types/enhanced.js").EnhancedTopMentionsV1Response {
    const tweetsMap = new Map<string, TwitterTweet>();
    const usersMap = new Map<string, TwitterUser>();

    twitterData.data?.forEach((tweet) => {
      tweetsMap.set(tweet.id, tweet);
    });

    twitterData.includes?.users?.forEach((user) => {
      usersMap.set(user.id, user);
    });

    const enhancedMentions = response.data.data.map((mention) => {
      const tweetId = this.extractTweetIdFromV1Mention(mention);
      const tweet = tweetId ? tweetsMap.get(tweetId) : undefined;
      const user = tweet ? usersMap.get(tweet.author_id) : undefined;

      if (tweet) {
        return {
          ...mention,
          content: tweet.text, // Override existing content with fresh Twitter content
          enhanced_metrics: this.calculateEnhancedMetrics(tweet, user),
          data_source: "elfa+twitter" as DataSource,
          twitter_data: { tweet, user },
        };
      }

      return {
        ...mention,
        data_source: "elfa" as DataSource,
      };
    });

    return {
      ...response,
      data: {
        ...response.data,
        data: enhancedMentions,
      },
    };
  }

  private extractTweetIdFromV1Mention(mention: {
    id?: string | number;
    url?: string;
    link?: string;
  }): string | null {
    // V1 mentions might have different ID structure
    if (mention.id && typeof mention.id === "string") {
      return mention.id;
    }
    if (mention.id && typeof mention.id === "number") {
      return mention.id.toString();
    }
    // Fallback to extracting from URL if available
    const url = mention.url || mention.link;
    if (url) {
      return this.extractTweetId(url);
    }
    return null;
  }

  private transformToEnhancedV1Format(
    response: import("../types/elfa.js").TopMentionsResponse,
    dataSource: DataSource,
  ): import("../types/enhanced.js").EnhancedTopMentionsV1Response {
    return {
      ...response,
      data: {
        ...response.data,
        data: response.data.data.map((mention) => ({
          ...mention,
          data_source: dataSource,
        })),
      },
    };
  }
}
