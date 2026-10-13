import { HttpClient } from "../utils/http.js";
import type {
  AssetClassV3,
  EntitiesV3Params,
  EntitiesV3Response,
  EventsV3Params,
  EventsV3Response,
  StorylinesV3Params,
  StorylinesV3Response,
  ArcsV3Params,
  ArcsV3Response,
  CallBookV3Params,
  CallBookV3Response,
  MindshareV3Params,
  MindshareV3Response,
  TrendingContractsV3Params,
  TrendingContractsV3Response,
  CallsV3Params,
  CallsV3Response,
  CallEpisodesV3Params,
  CallEpisodesV3Response,
  PositioningV3Params,
  PositioningV3Response,
  TopAccountsV3Params,
  TopAccountsV3Response,
  KeyStatusV3Response,
} from "../types/v3.js";

export interface V3ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  appName?: string;
  debug?: boolean;
}

const MOUNT = "/v3";

export class V3Client {
  private httpClient: HttpClient;

  constructor(options: V3ClientOptions) {
    this.httpClient = new HttpClient({
      baseURL: options.baseUrl ?? "https://api.elfa.ai",
      timeout: options.timeout ?? 30000,
      retries: options.retries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      ...(options.headers ? { headers: options.headers } : {}),
      ...(options.appName !== undefined ? { appName: options.appName } : {}),
      debug: options.debug ?? false,
    });
    this.httpClient.setAuthHeader(options.apiKey);
  }

  public updateOptions(
    options: Partial<Omit<V3ClientOptions, "apiKey" | "appName">>,
  ): void {
    this.httpClient.updateOptions({
      baseURL: options.baseUrl,
      timeout: options.timeout,
      retries: options.retries,
      retryDelay: options.retryDelay,
      headers: options.headers,
      debug: options.debug,
    });
  }

  public getEntities(params: EntitiesV3Params): Promise<EntitiesV3Response> {
    return this.get<EntitiesV3Response, EntitiesV3Params>("/entities", params, [
      "q",
      "entityType",
      "limit",
      "cursor",
    ]);
  }

  public getEvents(params: EventsV3Params = {}): Promise<EventsV3Response> {
    return this.get<EventsV3Response, EventsV3Params>("/events", params, [
      "q",
      "from",
      "to",
      "eventIds",
      "eventClass",
      "eventType",
      "implication",
      "entityIds",
      "assetClass",
      "novelty",
      "alertAction",
      "sort",
      "hasStoryline",
      "arcId",
      "notable",
      "order",
      "limit",
      "cursor",
    ]);
  }

  public getStorylines(
    params: StorylinesV3Params = {},
  ): Promise<StorylinesV3Response> {
    return this.get<StorylinesV3Response, StorylinesV3Params>(
      "/events/storylines",
      params,
      [
        "q",
        "from",
        "to",
        "storylineIds",
        "entityIds",
        "status",
        "relation",
        "order",
        "limit",
        "cursor",
      ],
    );
  }

  public getArcs(params: ArcsV3Params = {}): Promise<ArcsV3Response> {
    return this.get<ArcsV3Response, ArcsV3Params>("/events/arcs", params, [
      "q",
      "arcIds",
      "status",
      "assetClass",
      "entityIds",
      "sort",
      "order",
      "limit",
      "cursor",
    ]);
  }

  public getCallBook(
    market: AssetClassV3,
    params: CallBookV3Params,
  ): Promise<CallBookV3Response> {
    return this.get<CallBookV3Response, CallBookV3Params>(
      `/market/${market}/call-book`,
      params,
      ["from", "to", "order", "limit", "cursor"],
    );
  }

  public getMindshare(
    market: AssetClassV3,
    params: MindshareV3Params = {},
  ): Promise<MindshareV3Response> {
    return this.get<MindshareV3Response, MindshareV3Params>(
      `/market/${market}/mindshare`,
      params,
      ["period", "to", "limit", "cursor"],
    );
  }

  public getTrendingContracts(
    params: TrendingContractsV3Params,
  ): Promise<TrendingContractsV3Response> {
    return this.get<TrendingContractsV3Response, TrendingContractsV3Params>(
      "/market/crypto/trending-contracts",
      params,
      ["from", "to", "minMentions", "limit", "cursor"],
    );
  }

  public getCalls(params: CallsV3Params = {}): Promise<CallsV3Response> {
    return this.get<CallsV3Response, CallsV3Params>("/calls", params, [
      "from",
      "to",
      "callIds",
      "handle",
      "entityIds",
      "order",
      "limit",
      "cursor",
    ]);
  }

  public getCallEpisodes(
    params: CallEpisodesV3Params = {},
  ): Promise<CallEpisodesV3Response> {
    return this.get<CallEpisodesV3Response, CallEpisodesV3Params>(
      "/calls/episodes",
      params,
      [
        "from",
        "to",
        "episodeIds",
        "handle",
        "entityIds",
        "status",
        "direction",
        "assetClass",
        "order",
        "limit",
        "cursor",
      ],
    );
  }

  public getPositioning(
    params: PositioningV3Params,
  ): Promise<PositioningV3Response> {
    return this.get<PositioningV3Response, PositioningV3Params>(
      "/calls/positioning",
      params,
      ["entityId"],
    );
  }

  public getTopAccounts(
    params: TopAccountsV3Params = {},
  ): Promise<TopAccountsV3Response> {
    return this.get<TopAccountsV3Response, TopAccountsV3Params>(
      "/people/accounts",
      params,
      ["metric", "order", "limit", "cursor"],
    );
  }

  public getKeyStatus(): Promise<KeyStatusV3Response> {
    return this.get<KeyStatusV3Response, object>("/key-status", {}, []);
  }

  private async get<T, P extends object>(
    path: string,
    params: P,
    keys: ReadonlyArray<keyof P>,
  ): Promise<T> {
    return this.httpClient.get<T>(`${MOUNT}${path}${query(params, keys)}`);
  }
}

function query<P extends object>(
  params: P,
  keys: ReadonlyArray<keyof P>,
): string {
  const search = new URLSearchParams();
  for (const key of keys) {
    const value = params[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) search.append(String(key), value.join(","));
    } else {
      search.append(String(key), String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}
