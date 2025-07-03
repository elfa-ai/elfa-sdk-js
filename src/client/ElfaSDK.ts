import { ElfaV2Client } from "./ElfaV2Client.js";
import { TwitterClient } from "./TwitterClient.js";
import { ResponseEnhancer } from "../utils/enhancer.js";
import { ValidationError } from "../utils/errors.js";
import type {
  SDKOptions,
  RequestOptions,
  EnhancedResponse,
  EnhancementOptions,
} from "../types/enhanced.js";
import type {
  PingResponse,
  ApiKeyStatusResponse,
  TrendingTokensResponse,
  TrendingTokensParams,
  AccountSmartStatsResponse,
  AccountSmartStatsParams,
  KeywordMentionsV2Response,
  KeywordMentionsParams,
  TokenNewsV2Response,
  TokenNewsParams,
  TrendingCAsV2Response,
  TrendingCAsParams,
  TopMentionsParams,
  TopMentionsResponse,
  TopMentionsV2Params,
  TopMentionsV2Response,
  MentionsByKeywordsParams,
  GetMentionsByKeywordsResponse,
  MentionResponse,
  MentionsParams,
} from "../types/elfa.js";

export class ElfaSDK {
  private elfaClient: ElfaV2Client;
  private twitterClient?: TwitterClient;
  private enhancer: ResponseEnhancer;
  private options: SDKOptions & {
    baseUrl: string;
    fetchRawTweets: boolean;
    enhancementTimeout: number;
    maxBatchSize: number;
    strictMode: boolean;
    cacheEnhancements: boolean;
    respectRateLimits: boolean;
    retryOnRateLimit: boolean;
    debug: boolean;
  };

  constructor(options: SDKOptions) {
    this.validateOptions(options);

    this.options = {
      baseUrl: "https://api.elfa.ai",
      fetchRawTweets: false,
      enhancementTimeout: 30000,
      maxBatchSize: 100,
      strictMode: false,
      cacheEnhancements: false,
      respectRateLimits: true,
      retryOnRateLimit: true,
      debug: false,
      ...options,
    };

    this.elfaClient = new ElfaV2Client({
      apiKey: this.options.elfaApiKey,
      baseUrl: this.options.baseUrl,
      timeout: this.options.enhancementTimeout,
      debug: this.options.debug,
    });

    if (this.options.twitterApiKey) {
      this.twitterClient = new TwitterClient({
        bearerToken: this.options.twitterApiKey,
        timeout: this.options.enhancementTimeout,
      });
    }

    this.enhancer = new ResponseEnhancer(
      this.twitterClient,
      this.options.maxBatchSize,
    );
  }

  private validateOptions(options: SDKOptions): void {
    if (!options.elfaApiKey) {
      throw new ValidationError("elfaApiKey is required");
    }

    if (
      options.maxBatchSize !== undefined &&
      (options.maxBatchSize < 1 || options.maxBatchSize > 100)
    ) {
      throw new ValidationError("maxBatchSize must be between 1 and 100");
    }

    if (
      options.enhancementTimeout !== undefined &&
      options.enhancementTimeout < 1000
    ) {
      throw new ValidationError("enhancementTimeout must be at least 1000ms");
    }
  }

  public async ping(): Promise<PingResponse> {
    return this.elfaClient.ping();
  }

  public async getApiKeyStatus(): Promise<ApiKeyStatusResponse> {
    return this.elfaClient.getApiKeyStatus();
  }

  public async getTrendingTokens(
    params: TrendingTokensParams = {},
  ): Promise<TrendingTokensResponse> {
    return this.elfaClient.getTrendingTokens(params);
  }

  public async getAccountSmartStats(
    params: AccountSmartStatsParams,
  ): Promise<AccountSmartStatsResponse> {
    return this.elfaClient.getAccountSmartStats(params);
  }

  public async getKeywordMentions(
    params: KeywordMentionsParams & RequestOptions = {},
  ): Promise<EnhancedResponse<KeywordMentionsV2Response>> {
    const response = await this.elfaClient.getKeywordMentions(params);

    const shouldEnhance = this.shouldEnhanceResponse(params);
    if (!shouldEnhance) {
      return response as EnhancedResponse<KeywordMentionsV2Response>;
    }

    const enhancementOptions = this.buildEnhancementOptions(params);
    const enhancementResult = await this.enhancer.enhanceProcessedMentions(
      response.data,
      enhancementOptions,
    );

    return {
      ...response,
      data: enhancementResult.data,
      enhancement_info: enhancementResult.enhancement_info,
    } as EnhancedResponse<KeywordMentionsV2Response>;
  }

  public async getTokenNews(
    params: TokenNewsParams & RequestOptions = {},
  ): Promise<EnhancedResponse<TokenNewsV2Response>> {
    const response = await this.elfaClient.getTokenNews(params);

    const shouldEnhance = this.shouldEnhanceResponse(params);
    if (!shouldEnhance) {
      return response as EnhancedResponse<TokenNewsV2Response>;
    }

    const enhancementOptions = this.buildEnhancementOptions(params);
    const enhancementResult = await this.enhancer.enhanceProcessedMentions(
      response.data,
      enhancementOptions,
    );

    return {
      ...response,
      data: enhancementResult.data,
      enhancement_info: enhancementResult.enhancement_info,
    } as EnhancedResponse<TokenNewsV2Response>;
  }

  public async getTrendingCAsTwitter(
    params: TrendingCAsParams = {},
  ): Promise<TrendingCAsV2Response> {
    return this.elfaClient.getTrendingCAsTwitter(params);
  }

  public async getTrendingCAsTelegram(
    params: TrendingCAsParams = {},
  ): Promise<TrendingCAsV2Response> {
    return this.elfaClient.getTrendingCAsTelegram(params);
  }

  public async getTopMentions(
    params: TopMentionsParams & RequestOptions,
  ): Promise<EnhancedResponse<TopMentionsResponse>> {
    const response = await this.elfaClient.getV1TopMentions(params);

    // Note: TopMentions data structure doesn't match ProcessedMention format
    // Enhancement not implemented yet - would need custom enhancer method
    return response as EnhancedResponse<TopMentionsResponse>;
  }

  public async getTopMentionsV2(
    params: TopMentionsV2Params & RequestOptions,
  ): Promise<EnhancedResponse<TopMentionsV2Response>> {
    const response = await this.elfaClient.getTopMentions(params);

    // Note: TopMentionsV2 data structure doesn't match ProcessedMention format
    // Enhancement not implemented yet - would need custom enhancer method
    return response as EnhancedResponse<TopMentionsV2Response>;
  }

  public async getMentionsByKeywords(
    params: MentionsByKeywordsParams & RequestOptions,
  ): Promise<EnhancedResponse<GetMentionsByKeywordsResponse>> {
    const response = await this.elfaClient.getMentionsByKeywords(params);

    const shouldEnhance = this.shouldEnhanceResponse(params);
    if (!shouldEnhance) {
      return response as EnhancedResponse<GetMentionsByKeywordsResponse>;
    }

    const enhancementOptions = this.buildEnhancementOptions(params);
    const enhancementResult = await this.enhancer.enhanceSimpleMentions(
      response.data,
      enhancementOptions,
    );

    return {
      ...response,
      data: enhancementResult.data,
      enhancement_info: enhancementResult.enhancement_info,
    } as EnhancedResponse<GetMentionsByKeywordsResponse>;
  }

  public async getMentions(
    params: MentionsParams & RequestOptions = {},
  ): Promise<EnhancedResponse<MentionResponse>> {
    const response = await this.elfaClient.getMentions(params);

    const shouldEnhance = this.shouldEnhanceResponse(params);
    if (!shouldEnhance) {
      return response as EnhancedResponse<MentionResponse>;
    }

    // Note: MentionResponse uses Mention[] format which may need custom enhancement
    // For now, return without enhancement - TODO: implement custom enhancer
    return response as EnhancedResponse<MentionResponse>;
  }

  private shouldEnhanceResponse(params: RequestOptions): boolean {
    const fetchRawTweets = params.fetchRawTweets ?? this.options.fetchRawTweets;
    return fetchRawTweets && !!this.twitterClient;
  }

  private buildEnhancementOptions(params: RequestOptions): EnhancementOptions {
    return {
      includeContent: true,
      includeMetrics: true,
      fallbackToV2: !this.options.strictMode,
      batchSize: this.options.maxBatchSize,
      timeout: this.options.enhancementTimeout,
      ...params.enhancementOptions,
    };
  }

  public async testConnection(): Promise<{
    elfa: boolean;
    twitter?: boolean;
  }> {
    const results: { elfa: boolean; twitter?: boolean } = {
      elfa: false,
    };

    try {
      results.elfa = await this.elfaClient.testConnection();
    } catch {
      results.elfa = false;
    }

    if (this.twitterClient) {
      try {
        results.twitter = await this.twitterClient.testConnection();
      } catch {
        results.twitter = false;
      }
    }

    return results;
  }

  public isTwitterEnabled(): boolean {
    return !!this.twitterClient;
  }

  public getOptions() {
    return { ...this.options };
  }

  public updateOptions(newOptions: Partial<SDKOptions>): void {
    if (newOptions.elfaApiKey) {
      throw new ValidationError(
        "Cannot update elfaApiKey after initialization",
      );
    }

    if (newOptions.twitterApiKey) {
      throw new ValidationError(
        "Cannot update twitterApiKey after initialization",
      );
    }

    this.options = { ...this.options, ...newOptions };
  }
}
