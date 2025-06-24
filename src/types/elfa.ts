export interface PingResponse {
  success: true;
  data: {
    message: string;
  };
}

export interface ApiKeyStatus {
  id: number;
  name: string;
  status: 'active' | 'revoked' | 'expired' | 'payment_required';
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
    followerEngagementRatio: number;
    averageEngagement: number;
    smartFollowingCount: number;
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
  account?: {
    isVerified: boolean;
    username: string;
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
  chain: 'ethereum' | 'solana';
  mentionCount: number;
  changePercent: number;
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

export interface Account {
  id: number;
  username: string;
  data: {
    profileBannerUrl: string;
    profileImageUrl: string;
    description: string;
    userSince: string;
    location: string;
    name: string;
  };
  followerCount?: number;
  followingCount?: number;
  isVerified: boolean;
}

export interface Mention {
  id: number | string;
  type: string;
  content: string | null;
  originalUrl: string;
  data: any;
  likeCount: number | null;
  quoteCount: number | null;
  replyCount: number | null;
  repostCount: number | null;
  viewCount: number | null;
  mentionedAt: string;
  bookmarkCount: number | null;
  account?: Account;
}

export interface MentionResponse {
  success: boolean;
  data: Mention[];
  metadata: {
    offset: number;
    limit: number;
    total: number;
  };
}

export interface TopMentionsResponse {
  success: boolean;
  data: {
    pageSize: number;
    page: number;
    total: number;
    data: Array<{
      metrics: {
        view_count: number;
        repost_count: number;
        reply_count: number;
        like_count: number;
      };
      mentioned_at: string;
      content: string;
      id: number;
    }>;
  };
}

export interface AccountInfo {
  username: string;
  description?: string;
  profileImageUrl?: string;
}

export interface SimpleMention {
  id: number;
  twitter_id: string;
  twitter_user_id: string;
  parent_tweet_id: string;
  content: string;
  mentioned_at: string;
  type: string;
  twitter_account_info?: AccountInfo;
  metrics: {
    view_count: number;
    repost_count: number;
    reply_count: number;
    like_count: number;
  };
}

export interface GetMentionsByKeywordsResponse {
  success: boolean;
  data: SimpleMention[];
  metadata: {
    cursor?: string;
    total: number;
  };
}

export interface BasicAccount {
  twitterId: number;
  username: string;
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
  data: {
    description: string;
    userSince: string;
    location: string;
    name: string;
  };
}

export interface BasicCoin {
  name: string;
  symbol: string;
  coinId: string;
}

export interface MentionWithAccountAndToken {
  mentionId: number;
  content: string;
  type: string;
  originalUrl: string;
  mentionedAt: string;
  mentionedByType: 'general' | 'ct' | 'smart';
  sentiment: 'very-bullish' | 'bullish' | 'very-bearish' | 'bearish' | 'neutral';
  account: BasicAccount;
  coins: BasicCoin[];
}

export interface GetTokenMentionsResponse {
  success: boolean;
  data: {
    data: MentionWithAccountAndToken[];
  };
}

export interface TopMentionV2 {
  source_ref_id: string;
  original_url: string;
  like_count: number;
  repost_count: number;
  view_count: number;
  quote_count: number;
  reply_count: number;
  bookmark_count: number;
  mentioned_at: string;
  account_name: string;
  account_tags: string[];
}

export interface TopMentionsV2Response {
  success: boolean;
  data: TopMentionV2[];
  metadata: {
    pageSize: number;
    page: number;
    total: number;
  };
}

export interface TrendingTokensParams {
  timeWindow?: string;
  page?: number;
  pageSize?: number;
  minMentions?: number;
}

export interface KeywordMentionsParams {
  keywords?: string;
  accountName?: string;
  period?: string;
  from?: number;
  to?: number;
  limit?: number;
  searchType?: string;
  cursor?: string;
}

export interface TokenNewsParams {
  from?: number;
  to?: number;
  page?: number;
  pageSize?: number;
  coinIds?: string;
}

export interface TrendingCAsParams {
  timeWindow?: string;
  page?: number;
  pageSize?: number;
  minMentions?: number;
}

export interface AccountSmartStatsParams {
  username: string;
}

export interface TopMentionsParams {
  ticker: string;
  timeWindow?: string;
  page?: number;
  pageSize?: number;
  includeAccountDetails?: boolean;
}

export interface TopMentionsV2Params {
  ticker: string;
  timeWindow?: string;
  from?: number;
  to?: number;
  page?: number;
  pageSize?: number;
}

export interface MentionsByKeywordsParams {
  keywords: string;
  from: number;
  to: number;
  limit?: number;
  searchType?: string;
  cursor?: string;
}

export interface MentionsParams {
  limit?: number;
  offset?: number;
}