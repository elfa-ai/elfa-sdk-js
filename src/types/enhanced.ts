import type {
  ProcessedMention,
  SimpleMention,
  MentionWithAccountAndToken,
  KeywordMentionsV2Response,
  GetMentionsByKeywordsResponse,
  TopMentionsResponse,
  TokenNewsV2Response,
  GetTokenMentionsResponse,
} from "./elfa.js";
import type { TwitterTweet, TwitterUser } from "./twitter.js";

export type DataSource = "elfa" | "elfa+twitter";

export interface EnhancedMetrics {
  impression_count?: number;
  engagement_rate?: number;
  reach?: number;
  twitter_verified?: boolean;
}

export interface EnhancedProcessedMention extends ProcessedMention {
  content?: string;
  enhanced_metrics?: EnhancedMetrics;
  data_source: DataSource;
  twitter_data?: {
    tweet?: TwitterTweet;
    user?: TwitterUser;
  };
}

export interface EnhancedSimpleMention extends SimpleMention {
  enhanced_metrics?: EnhancedMetrics;
  data_source: DataSource;
  twitter_data?: {
    tweet?: TwitterTweet;
    user?: TwitterUser;
  };
}

export interface EnhancedMentionWithAccountAndToken
  extends MentionWithAccountAndToken {
  enhanced_metrics?: EnhancedMetrics;
  data_source: DataSource;
  twitter_data?: {
    tweet?: TwitterTweet;
    user?: TwitterUser;
  };
}

export interface EnhancedKeywordMentionsV2Response
  extends Omit<KeywordMentionsV2Response, "data"> {
  data: EnhancedProcessedMention[];
  enhancement_info: {
    total_enhanced: number;
    failed_enhancements: number;
    twitter_api_used: boolean;
  };
}

export interface EnhancedGetMentionsByKeywordsResponse
  extends Omit<GetMentionsByKeywordsResponse, "data"> {
  data: EnhancedSimpleMention[];
  enhancement_info: {
    total_enhanced: number;
    failed_enhancements: number;
    twitter_api_used: boolean;
  };
}

export interface EnhancedTopMentionV2 {
  tweetId: string;
  link: string;
  likeCount: number;
  repostCount: number;
  viewCount: number;
  quoteCount: number;
  replyCount: number;
  bookmarkCount: number;
  mentionedAt: string;
  type: string;
  account?: {
    isVerified: boolean;
    username: string;
  };
  repostBreakdown: {
    smart: number;
    ct: number;
  };
  content?: string;
  enhanced_metrics?: EnhancedMetrics;
  data_source: DataSource;
  twitter_data?: {
    tweet?: TwitterTweet;
    user?: TwitterUser;
  };
}

export interface EnhancedTopMentionsResponse
  extends Omit<TopMentionsResponse, "data"> {
  data: {
    pageSize: number;
    page: number;
    total: number;
    data: Array<
      TopMentionsResponse["data"]["data"][0] & {
        enhanced_metrics?: EnhancedMetrics;
        data_source: DataSource;
        twitter_data?: {
          tweet?: TwitterTweet;
          user?: TwitterUser;
        };
      }
    >;
  };
  enhancement_info: {
    total_enhanced: number;
    failed_enhancements: number;
    twitter_api_used: boolean;
  };
}

export interface EnhancedTopMentionsV1Response extends TopMentionsResponse {
  data: {
    pageSize: number;
    page: number;
    total: number;
    data: Array<
      TopMentionsResponse["data"]["data"][0] & {
        enhanced_metrics?: EnhancedMetrics;
        data_source: DataSource;
        twitter_data?: {
          tweet?: TwitterTweet;
          user?: TwitterUser;
        };
      }
    >;
  };
}

export interface EnhancedTopMentionsV2Response {
  success: boolean;
  data: EnhancedTopMentionV2[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
  };
  enhancement_info: {
    total_enhanced: number;
    failed_enhancements: number;
    twitter_api_used: boolean;
  };
}

export interface EnhancedTokenNewsV2Response
  extends Omit<TokenNewsV2Response, "data"> {
  data: EnhancedProcessedMention[];
  enhancement_info: {
    total_enhanced: number;
    failed_enhancements: number;
    twitter_api_used: boolean;
  };
}

export interface EnhancedGetTokenMentionsResponse
  extends Omit<GetTokenMentionsResponse, "data"> {
  data: {
    data: EnhancedMentionWithAccountAndToken[];
  };
  enhancement_info: {
    total_enhanced: number;
    failed_enhancements: number;
    twitter_api_used: boolean;
  };
}

export interface EnhancementOptions {
  includeContent?: boolean;
  includeMetrics?: boolean;
  fallbackToV2?: boolean;
  batchSize?: number;
  timeout?: number;
}

export interface EnhancementResult<T> {
  data: T;
  enhancement_info: {
    total_enhanced: number;
    failed_enhancements: number;
    twitter_api_used: boolean;
    errors?: string[];
  };
}

export interface SDKOptions {
  elfaApiKey: string;
  twitterApiKey?: string;
  baseUrl?: string;
  fetchRawTweets?: boolean;
  enhancementTimeout?: number;
  maxBatchSize?: number;
  strictMode?: boolean;
  cacheEnhancements?: boolean;
  respectRateLimits?: boolean;
  retryOnRateLimit?: boolean;
  debug?: boolean;
}

export interface RequestOptions {
  fetchRawTweets?: boolean;
  enhancementOptions?: EnhancementOptions;
  timeout?: number;
}

export type EnhancedResponse<T> = T extends KeywordMentionsV2Response
  ? EnhancedKeywordMentionsV2Response | KeywordMentionsV2Response
  : T extends GetMentionsByKeywordsResponse
    ? EnhancedGetMentionsByKeywordsResponse | GetMentionsByKeywordsResponse
    : T extends TopMentionsResponse
      ? EnhancedTopMentionsResponse | TopMentionsResponse
      : T extends import("./elfa.js").TopMentionsV2Response
        ? EnhancedTopMentionsV2Response | import("./elfa.js").TopMentionsV2Response
        : T extends TokenNewsV2Response
          ? EnhancedTokenNewsV2Response | TokenNewsV2Response
          : T extends GetTokenMentionsResponse
            ? EnhancedGetTokenMentionsResponse | GetTokenMentionsResponse
            : T;
