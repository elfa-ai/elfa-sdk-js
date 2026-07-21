import { ElfaV2Client } from "./ElfaV2Client.js";
import { AutoClient } from "./AutoClient.js";
import { TradeClient } from "./TradeClient.js";
import { ValidationError } from "../utils/errors.js";
import type { SDKOptions } from "../types/options.js";
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
  TopMentionsV2Params,
  TopMentionsV2Response,
  EventSummaryV2Response,
  EventSummaryV2Params,
  TrendingNarrativesResponse,
  TrendingNarrativesParams,
} from "../types/elfa.js";
import type { ChatParams, ChatResponse } from "../types/chat.js";

export class ElfaSDK {
  public readonly auto: AutoClient;
  public readonly trade: TradeClient;
  private elfaClient: ElfaV2Client;
  private options: SDKOptions & {
    baseUrl: string;
    timeout: number;
    debug: boolean;
  };

  constructor(options: SDKOptions) {
    this.validateOptions(options);

    this.options = {
      baseUrl: "https://api.elfa.ai",
      timeout: 30000,
      debug: false,
      ...options,
    };

    const clientOptions = {
      apiKey: this.options.elfaApiKey,
      baseUrl: this.options.baseUrl,
      timeout: this.options.timeout,
      retries: this.options.retries,
      retryDelay: this.options.retryDelay,
      debug: this.options.debug,
      ...(this.options.hmacSecret
        ? { hmacSecret: this.options.hmacSecret }
        : {}),
    };

    this.elfaClient = new ElfaV2Client(clientOptions);
    this.auto = new AutoClient(clientOptions);
    this.trade = new TradeClient(clientOptions);
  }

  private validateOptions(options: SDKOptions): void {
    if (!options.elfaApiKey) {
      throw new ValidationError("elfaApiKey is required");
    }

    if (options.timeout !== undefined && options.timeout < 1000) {
      throw new ValidationError("timeout must be at least 1000ms");
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
    params: KeywordMentionsParams = {},
  ): Promise<KeywordMentionsV2Response> {
    return this.elfaClient.getKeywordMentions(params);
  }

  public async getTokenNews(
    params: TokenNewsParams = {},
  ): Promise<TokenNewsV2Response> {
    return this.elfaClient.getTokenNews(params);
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
    params: TopMentionsV2Params,
  ): Promise<TopMentionsV2Response> {
    return this.elfaClient.getTopMentions(params);
  }

  public async getEventSummary(
    params: EventSummaryV2Params,
  ): Promise<EventSummaryV2Response> {
    return this.elfaClient.getEventSummary(params);
  }

  public async getTrendingNarratives(
    params: TrendingNarrativesParams = {},
  ): Promise<TrendingNarrativesResponse> {
    return this.elfaClient.getTrendingNarratives(params);
  }

  public async chat(params: ChatParams): Promise<ChatResponse> {
    return this.elfaClient.chat(params);
  }

  public async testConnection(): Promise<boolean> {
    try {
      return await this.elfaClient.testConnection();
    } catch {
      return false;
    }
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

    this.options = { ...this.options, ...newOptions };
  }
}
