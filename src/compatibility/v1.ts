import { ElfaSDK } from '../client/ElfaSDK.js';
import type { SDKOptions } from '../types/enhanced.js';
import type {
  TrendingTokensResponse,
  TopMentionsResponse,
  GetMentionsByKeywordsResponse,
  AccountSmartStatsResponse
} from '../types/elfa.js';

export interface V1CompatibilityOptions extends SDKOptions {
  enableV1Behavior?: boolean;
}

export interface LegacyTopMentionsParams {
  ticker: string;
  timeWindow?: string;
  page?: number;
  pageSize?: number;
  includeAccountDetails?: boolean;
  fetchRawTweets?: boolean;
}

export interface LegacySearchParams {
  keywords: string;
  from: number;
  to: number;
  limit?: number;
  searchType?: 'and' | 'or';
  cursor?: string;
  fetchRawTweets?: boolean;
}

export interface LegacyTrendingParams {
  timeWindow?: string;
  page?: number;
  pageSize?: number;
  minMentions?: number;
}

export interface LegacyAccountStatsParams {
  username: string;
}

export interface LegacyMentionsParams {
  limit?: number;
  offset?: number;
  fetchRawTweets?: boolean;
}

export class V1CompatibilityLayer {
  private sdk: ElfaSDK;
  private enableV1Behavior: boolean;

  constructor(options: V1CompatibilityOptions) {
    this.enableV1Behavior = options.enableV1Behavior ?? true;
    
    const sdkOptions: SDKOptions = {
      ...options,
      fetchRawTweets: options.fetchRawTweets ?? this.enableV1Behavior
    };
    
    this.sdk = new ElfaSDK(sdkOptions);
  }

  public async getTopMentions(params: LegacyTopMentionsParams): Promise<TopMentionsResponse> {
    const fetchRawTweets = params.fetchRawTweets ?? this.enableV1Behavior;
    
    const cleanParams: any = {
      ticker: params.ticker,
      fetchRawTweets
    };
    
    if (params.timeWindow !== undefined) cleanParams.timeWindow = params.timeWindow;
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.pageSize !== undefined) cleanParams.pageSize = params.pageSize;
    if (params.includeAccountDetails !== undefined) cleanParams.includeAccountDetails = params.includeAccountDetails;
    
    return this.sdk.getTopMentions(cleanParams);
  }

  public async getMentionsByKeywords(params: LegacySearchParams): Promise<GetMentionsByKeywordsResponse> {
    const fetchRawTweets = params.fetchRawTweets ?? this.enableV1Behavior;
    
    const cleanParams: any = {
      keywords: params.keywords,
      from: params.from,
      to: params.to,
      fetchRawTweets
    };
    
    if (params.limit !== undefined) cleanParams.limit = params.limit;
    if (params.searchType !== undefined) cleanParams.searchType = params.searchType;
    if (params.cursor !== undefined) cleanParams.cursor = params.cursor;
    
    return this.sdk.getMentionsByKeywords(cleanParams);
  }

  public async getTrendingTokens(params: LegacyTrendingParams = {}): Promise<TrendingTokensResponse> {
    const cleanParams: any = {};
    
    if (params.timeWindow !== undefined) cleanParams.timeWindow = params.timeWindow;
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.pageSize !== undefined) cleanParams.pageSize = params.pageSize;
    if (params.minMentions !== undefined) cleanParams.minMentions = params.minMentions;
    
    return this.sdk.getTrendingTokens(cleanParams);
  }

  public async getAccountSmartStats(params: LegacyAccountStatsParams): Promise<AccountSmartStatsResponse> {
    return this.sdk.getAccountSmartStats({
      username: params.username
    });
  }

  public async getMentions(_params: LegacyMentionsParams = {}): Promise<any> {
    // Note: This method maps to the general keyword mentions endpoint
    // Users should migrate to more specific methods
    throw new Error('getMentions is deprecated. Please use getKeywordMentions() or getTopMentions() instead.');
  }

  public async ping(): Promise<{ success: boolean; message: string }> {
    const response = await this.sdk.ping();
    return {
      success: response.success,
      message: response.data.message
    };
  }

  public async getKeyStatus(): Promise<any> {
    return this.sdk.getApiKeyStatus();
  }

  public isTwitterEnabled(): boolean {
    return this.sdk.isTwitterEnabled();
  }

  public async testConnection(): Promise<boolean> {
    const results = await this.sdk.testConnection();
    return results.elfa && (!this.sdk.isTwitterEnabled() || results.twitter === true);
  }

  public getSDK(): ElfaSDK {
    return this.sdk;
  }
}

export function createV1CompatibleClient(options: V1CompatibilityOptions): V1CompatibilityLayer {
  return new V1CompatibilityLayer(options);
}

export default V1CompatibilityLayer;