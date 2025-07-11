import { HttpClient } from "../utils/http.js";
import { ValidationError } from "../utils/errors.js";
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
  MentionResponse,
  MentionsParams,
  TopMentionsResponse,
  TopMentionsParams,
  TopMentionsV2Response,
  TopMentionsV2Params,
  GetMentionsByKeywordsResponse,
  MentionsByKeywordsParams,
  EventSummaryV2Response,
  EventSummaryV2Params,
} from "../types/elfa.js";

export interface ElfaV2ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export class ElfaV2Client {
  private httpClient: HttpClient;
  private options: ElfaV2ClientOptions;

  constructor(options: ElfaV2ClientOptions) {
    this.options = {
      baseUrl: "https://api.elfa.ai",
      timeout: 30000,
      retries: 3,
      debug: false,
      ...options,
    };

    const httpOptions: any = {
      baseURL: this.options.baseUrl,
    };

    if (this.options.timeout !== undefined) {
      httpOptions.timeout = this.options.timeout;
    }

    if (this.options.retries !== undefined) {
      httpOptions.retries = this.options.retries;
    }

    if (this.options.debug !== undefined) {
      httpOptions.debug = this.options.debug;
    }

    this.httpClient = new HttpClient(httpOptions);

    this.httpClient.setAuthHeader(this.options.apiKey);
  }

  private validateTimeWindowOrFromTo(params: {
    timeWindow?: string;
    from?: number;
    to?: number;
  }): void {
    const hasTimeWindow = !!params.timeWindow;
    const hasFrom = params.from !== undefined;
    const hasTo = params.to !== undefined;

    // If only one of from/to is provided (but not both), that's invalid
    if ((hasFrom && !hasTo) || (!hasFrom && hasTo)) {
      throw new ValidationError(
        "When using from/to parameters, both from and to must be provided",
      );
    }

    // Must provide either timeWindow OR both from and to
    if (!hasTimeWindow && (!hasFrom || !hasTo)) {
      throw new ValidationError(
        "You must provide either timeWindow or both from and to parameters",
      );
    }

    // If both from and to are provided, they take priority (this is allowed per API spec)
    // This is valid and no further validation needed
  }

  public async ping(): Promise<PingResponse> {
    return this.httpClient.get<PingResponse>("/v2/ping");
  }

  public async getApiKeyStatus(): Promise<ApiKeyStatusResponse> {
    return this.httpClient.get<ApiKeyStatusResponse>("/v2/key-status");
  }

  public async getTrendingTokens(
    params: TrendingTokensParams = {},
  ): Promise<TrendingTokensResponse> {
    this.validateTimeWindowOrFromTo(params);

    const searchParams = new URLSearchParams();

    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.from !== undefined) {
      searchParams.append("from", params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append("to", params.to.toString());
    }
    if (params.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append("pageSize", params.pageSize.toString());
    }
    if (params.minMentions !== undefined) {
      searchParams.append("minMentions", params.minMentions.toString());
    }

    const url = `/v2/aggregations/trending-tokens${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.httpClient.get<TrendingTokensResponse>(url);
  }

  public async getAccountSmartStats(
    params: AccountSmartStatsParams,
  ): Promise<AccountSmartStatsResponse> {
    if (!params.username) {
      throw new ValidationError("Username is required");
    }

    const searchParams = new URLSearchParams();
    searchParams.append("username", params.username);

    return this.httpClient.get<AccountSmartStatsResponse>(
      `/v2/account/smart-stats?${searchParams}`,
    );
  }

  public async getKeywordMentions(
    params: KeywordMentionsParams,
  ): Promise<KeywordMentionsV2Response> {
    if (!params.keywords && !params.accountName) {
      throw new ValidationError(
        "Either keywords or accountName must be provided",
      );
    }

    const searchParams = new URLSearchParams();

    if (params.keywords) {
      searchParams.append("keywords", params.keywords);
    }
    if (params.accountName) {
      searchParams.append("accountName", params.accountName);
    }
    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.from !== undefined) {
      searchParams.append("from", params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append("to", params.to.toString());
    }
    if (params.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params.searchType) {
      searchParams.append("searchType", params.searchType);
    }
    if (params.cursor) {
      searchParams.append("cursor", params.cursor);
    }
    if (params.reposts !== undefined) {
      searchParams.append("reposts", params.reposts.toString());
    }

    return this.httpClient.get<KeywordMentionsV2Response>(
      `/v2/data/keyword-mentions?${searchParams}`,
    );
  }

  public async getTokenNews(
    params: TokenNewsParams = {},
  ): Promise<TokenNewsV2Response> {
    const searchParams = new URLSearchParams();

    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.from !== undefined) {
      searchParams.append("from", params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append("to", params.to.toString());
    }
    if (params.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append("pageSize", params.pageSize.toString());
    }
    if (params.coinIds) {
      searchParams.append("coinIds", params.coinIds);
    }
    if (params.reposts !== undefined) {
      searchParams.append("reposts", params.reposts.toString());
    }

    const url = `/v2/data/token-news${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.httpClient.get<TokenNewsV2Response>(url);
  }

  public async getTrendingCAsTwitter(
    params: TrendingCAsParams = {},
  ): Promise<TrendingCAsV2Response> {
    this.validateTimeWindowOrFromTo(params);

    const searchParams = new URLSearchParams();

    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.from !== undefined) {
      searchParams.append("from", params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append("to", params.to.toString());
    }
    if (params.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append("pageSize", params.pageSize.toString());
    }
    if (params.minMentions !== undefined) {
      searchParams.append("minMentions", params.minMentions.toString());
    }

    const url = `/v2/aggregations/trending-cas/twitter${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.httpClient.get<TrendingCAsV2Response>(url);
  }

  public async getTrendingCAsTelegram(
    params: TrendingCAsParams = {},
  ): Promise<TrendingCAsV2Response> {
    this.validateTimeWindowOrFromTo(params);

    const searchParams = new URLSearchParams();

    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.from !== undefined) {
      searchParams.append("from", params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append("to", params.to.toString());
    }
    if (params.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append("pageSize", params.pageSize.toString());
    }
    if (params.minMentions !== undefined) {
      searchParams.append("minMentions", params.minMentions.toString());
    }

    const url = `/v2/aggregations/trending-cas/telegram${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.httpClient.get<TrendingCAsV2Response>(url);
  }

  public async getMentions(
    params: MentionsParams = {},
  ): Promise<MentionResponse> {
    const searchParams = new URLSearchParams();

    if (params.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params.offset !== undefined) {
      searchParams.append("offset", params.offset.toString());
    }

    const url = `/v1/mentions${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.httpClient.get<MentionResponse>(url);
  }

  public async getV1TopMentions(
    params: TopMentionsParams,
  ): Promise<TopMentionsResponse> {
    if (!params.ticker) {
      throw new ValidationError("Ticker is required");
    }

    const searchParams = new URLSearchParams();
    searchParams.append("ticker", params.ticker);

    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.from !== undefined) {
      searchParams.append("from", params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append("to", params.to.toString());
    }
    if (params.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append("pageSize", params.pageSize.toString());
    }
    // Note: includeAccountDetails parameter is ignored when using V2 endpoint
    // V2 endpoint provides account details by default in a different format

    return this.httpClient.get<TopMentionsResponse>(
      `/v2/data/top-mentions?${searchParams}`,
    );
  }

  public async getMentionsByKeywords(
    params: MentionsByKeywordsParams,
  ): Promise<GetMentionsByKeywordsResponse> {
    if (!params.keywords) {
      throw new ValidationError("Keywords are required");
    }
    if (params.from === undefined || params.to === undefined) {
      throw new ValidationError("Both from and to timestamps are required");
    }

    const searchParams = new URLSearchParams();
    searchParams.append("keywords", params.keywords);
    searchParams.append("from", params.from.toString());
    searchParams.append("to", params.to.toString());

    if (params.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params.searchType) {
      searchParams.append("searchType", params.searchType);
    }
    if (params.cursor) {
      searchParams.append("cursor", params.cursor);
    }
    if (params.reposts !== undefined) {
      searchParams.append("reposts", params.reposts.toString());
    }

    return this.httpClient.get<GetMentionsByKeywordsResponse>(
      `/v2/data/keyword-mentions?${searchParams}`,
    );
  }

  public async getV1TrendingTokens(
    params: TrendingTokensParams = {},
  ): Promise<TrendingTokensResponse> {
    const searchParams = new URLSearchParams();

    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append("pageSize", params.pageSize.toString());
    }
    if (params.minMentions !== undefined) {
      searchParams.append("minMentions", params.minMentions.toString());
    }

    const url = `/v2/aggregations/trending-tokens${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.httpClient.get<TrendingTokensResponse>(url);
  }

  public async getV1AccountSmartStats(
    params: AccountSmartStatsParams,
  ): Promise<AccountSmartStatsResponse> {
    if (!params.username) {
      throw new ValidationError("Username is required");
    }

    const searchParams = new URLSearchParams();
    searchParams.append("username", params.username);

    return this.httpClient.get<AccountSmartStatsResponse>(
      `/v2/account/smart-stats?${searchParams}`,
    );
  }

  public async getTopMentions(
    params: TopMentionsV2Params,
  ): Promise<TopMentionsV2Response> {
    if (!params.ticker) {
      throw new ValidationError("Ticker is required");
    }

    const searchParams = new URLSearchParams();
    searchParams.append("ticker", params.ticker);

    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.from !== undefined) {
      searchParams.append("from", params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append("to", params.to.toString());
    }
    if (params.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append("pageSize", params.pageSize.toString());
    }
    if (params.reposts !== undefined) {
      searchParams.append("reposts", params.reposts.toString());
    }

    return this.httpClient.get<TopMentionsV2Response>(
      `/v2/data/top-mentions?${searchParams}`,
    );
  }

  public async getEventSummary(
    params: EventSummaryV2Params,
  ): Promise<EventSummaryV2Response> {
    if (!params.keywords) {
      throw new ValidationError("Keywords are required");
    }

    const searchParams = new URLSearchParams();
    searchParams.append("keywords", params.keywords);

    if (params.from !== undefined) {
      searchParams.append("from", params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append("to", params.to.toString());
    }
    if (params.timeWindow) {
      searchParams.append("timeWindow", params.timeWindow);
    }
    if (params.searchType) {
      searchParams.append("searchType", params.searchType);
    }

    return this.httpClient.get<EventSummaryV2Response>(
      `/v2/data/event-summary?${searchParams}`,
    );
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.ping();
      return response.success === true;
    } catch {
      return false;
    }
  }
}
