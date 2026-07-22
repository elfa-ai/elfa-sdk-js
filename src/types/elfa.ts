export interface PingResponse {
  success: true;
  data: {
    message: string;
  };
}

export interface ApiKeyStatus {
  id: number;
  name: string;
  status: "active" | "revoked" | "expired" | "payment_required";
  dailyRequestLimit: number;
  monthlyRequestLimit: number;
  expiresAt: string;
  createdAt: string;
  usage: {
    monthly: number;
    daily: number;
  };
  limits: {
    monthly: number;
    daily: number;
  };
  isExpired: boolean;
  remainingRequests: {
    monthly: number;
    daily: number;
  };
}

export interface ApiKeyStatusData {
  name: string;
  dailyLimit: number;
  monthlyLimit: number;
  tier: string;
  usage: {
    remainingMonthly: number;
    remainingDaily: number;
    month: number;
    today: number;
  };
  subscription: {
    billingInterval?: string;
    overageUsage?: number;
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: string;
    status: string;
  };
  allowOverage: boolean;
  maxOverage?: number;
}

export interface ApiKeyStatusResponse {
  success: boolean;
  data: ApiKeyStatus | ApiKeyStatusData;
}

export interface TrendingToken {
  change_percent: number;
  previous_count: number;
  current_count: number;
  token: string;
}

export interface TrendingTokensResponse {
  success: boolean;
  data: {
    pageSize: number;
    page: number;
    total: number;
    data: TrendingToken[];
  };
}

export interface AccountSmartStatsResponse {
  success: boolean;
  data: {
    smartFollowingCount: number;
    averageEngagement: number;
    averageReach: number;
    smartFollowerCount?: number;
    followerCount?: number;
  };
}

export interface ProcessedMention {
  tweetId: string;
  link: string;
  likeCount: number | null;
  repostCount: number | null;
  viewCount: number | null;
  quoteCount: number | null;
  replyCount: number | null;
  bookmarkCount: number | null;
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
}

export interface KeywordMentionsV2Response {
  success: boolean;
  data: ProcessedMention[];
  metadata: {
    cursor?: string;
    total: number;
  };
}

export interface TokenNewsV2Response {
  success: boolean;
  data: ProcessedMention[];
  metadata: {
    pageSize: number;
    page: number;
    total: number;
  };
}

export interface TrendingContractAddress {
  contractAddress: string;
  chain: "ethereum" | "solana";
  mentionCount: number;
}

export interface TrendingCAsV2Response {
  success: boolean;
  data: {
    pageSize: number;
    page: number;
    total: number;
    data: TrendingContractAddress[];
  };
}

export interface TopMentionV2 {
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
}

export interface TopMentionsV2Response {
  success: boolean;
  data: TopMentionV2[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface TrendingTokensParams {
  timeWindow?: string;
  from?: number;
  to?: number;
  page?: number;
  pageSize?: number;
  minMentions?: number;
}

export interface KeywordMentionsParams {
  keywords?: string;
  accountName?: string;
  timeWindow?: string;
  from?: number;
  to?: number;
  limit?: number;
  searchType?: string;
  cursor?: string;
  reposts?: boolean;
}

export interface TokenNewsParams {
  timeWindow?: string;
  from?: number;
  to?: number;
  page?: number;
  pageSize?: number;
  coinIds?: string;
  reposts?: boolean;
}

export interface TrendingCAsParams {
  timeWindow?: string;
  from?: number;
  to?: number;
  page?: number;
  pageSize?: number;
  minMentions?: number;
}

export interface AccountSmartStatsParams {
  username: string;
}

export interface TopMentionsV2Params {
  ticker: string;
  timeWindow?: string;
  from?: number;
  to?: number;
  page?: number;
  pageSize?: number;
  reposts?: boolean;
}

export interface EventSummaryV2Response {
  success: boolean;
  data: Array<{
    tweetIds: string[];
    sourceLinks: string[];
    summary: string;
  }>;
  metadata: {
    summaries: number;
    total_summarized: number;
    total: number;
  };
}

export interface EventSummaryV2Params {
  keywords: string;
  from?: number;
  to?: number;
  timeWindow?: string;
  searchType?: string;
}

export interface TrendingNarrative {
  narrative: string;
  source_links: string[];
  tweet_ids: string[];
}

export interface TrendingNarrativesResponse {
  success: boolean;
  data: {
    trending_narratives: TrendingNarrative[];
    metadata: {
      total_narratives?: number;
      total_tweets?: number;
      error?: string;
    };
  };
}

export interface TrendingNarrativesParams {
  timeFrame?: "day" | "week";
  maxNarratives?: number;
  maxTweetsPerNarrative?: number;
}
