import { HttpClient, throwForFetchResponse } from "../utils/http.js";
import { NetworkError } from "../utils/errors.js";
import { signRequest } from "../utils/hmac.js";
import { readSSE } from "../utils/sse.js";
import type {
  AutoChatParams,
  AutoChatResponse,
  AutoQueryInput,
  AutoValidateResponse,
  AutoQuery,
  AutoListQueriesParams,
  AutoListQueriesResponse,
  AutoPollQueryResponse,
  AutoDraft,
  AutoUpsertDraftInput,
  AutoListDraftsResponse,
  AutoListSessionsResponse,
  AutoSession,
  AutoListExecutionsParams,
  AutoListExecutionsResponse,
  AutoExecution,
  AutoListExchangesResponse,
  AutoConnectExchangeInput,
  AutoExchangeConnection,
  AutoValidateSymbolResponse,
  AutoStreamEvent,
  TradableExchange,
} from "../types/auto.js";

export interface AutoClientOptions {
  apiKey: string;
  baseUrl?: string;
  hmacSecret?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  debug?: boolean;
}

const MOUNT = "/v2/auto";

export class AutoClient {
  private httpClient: HttpClient;
  private baseUrl: string;
  private apiKey: string;
  private hmacSecret?: string;
  private headers?: Record<string, string>;

  constructor(options: AutoClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://api.elfa.ai";
    this.apiKey = options.apiKey;
    if (options.hmacSecret) this.hmacSecret = options.hmacSecret;
    if (options.headers) this.headers = options.headers;

    this.httpClient = new HttpClient({
      baseURL: this.baseUrl,
      timeout: options.timeout ?? 30000,
      retries: options.retries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      ...(options.headers ? { headers: options.headers } : {}),
      debug: options.debug ?? false,
    });
    this.httpClient.setAuthHeader(this.apiKey);
  }

  public chat(params: AutoChatParams): Promise<AutoChatResponse> {
    return this.post<AutoChatResponse>("/chat", params);
  }

  public validateQuery(input: AutoQueryInput): Promise<AutoValidateResponse> {
    return this.post<AutoValidateResponse>("/queries/validate", input);
  }

  public createQuery(input: AutoQueryInput): Promise<AutoQuery> {
    return this.post<AutoQuery>("/queries", input);
  }

  public listQueries(
    params: AutoListQueriesParams = {},
  ): Promise<AutoListQueriesResponse> {
    return this.get<AutoListQueriesResponse>("/queries", params);
  }

  public getQuery(queryId: string): Promise<AutoPollQueryResponse> {
    return this.get<AutoPollQueryResponse>(`/queries/${queryId}`);
  }

  public cancelQuery(queryId: string): Promise<AutoQuery> {
    return this.post<AutoQuery>(`/queries/${queryId}/cancel`);
  }

  public deleteQuery(queryId: string): Promise<AutoQuery> {
    return this.delete<AutoQuery>(`/queries/${queryId}`);
  }

  public listDrafts(
    params: AutoListQueriesParams = {},
  ): Promise<AutoListDraftsResponse> {
    return this.get<AutoListDraftsResponse>("/queries/drafts", params);
  }

  public getDraft(draftId: string): Promise<AutoDraft> {
    return this.get<AutoDraft>(`/queries/drafts/${draftId}`);
  }

  public upsertDraft(input: AutoUpsertDraftInput): Promise<AutoDraft> {
    return this.post<AutoDraft>("/queries/drafts", input);
  }

  public deleteDraft(draftId: string): Promise<unknown> {
    return this.delete<unknown>(`/queries/drafts/${draftId}`);
  }

  public validateDraft(draftId: string): Promise<AutoValidateResponse> {
    return this.post<AutoValidateResponse>(
      `/queries/drafts/${draftId}/validate`,
    );
  }

  public convertDraft(draftId: string): Promise<AutoQuery> {
    return this.post<AutoQuery>(`/queries/drafts/${draftId}/convert`);
  }

  public listSessions(queryId: string): Promise<AutoListSessionsResponse> {
    return this.get<AutoListSessionsResponse>(`/queries/${queryId}/sessions`);
  }

  public getSession(queryId: string, sessionId: string): Promise<AutoSession> {
    return this.get<AutoSession>(`/queries/${queryId}/sessions/${sessionId}`);
  }

  public listExecutions(
    params: AutoListExecutionsParams = {},
  ): Promise<AutoListExecutionsResponse> {
    return this.get<AutoListExecutionsResponse>("/executions", params);
  }

  public getExecution(executionId: string): Promise<AutoExecution> {
    return this.get<AutoExecution>(`/executions/${executionId}`);
  }

  public listExchanges(): Promise<AutoListExchangesResponse> {
    return this.get<AutoListExchangesResponse>("/exchanges");
  }

  public connectExchange(
    input: AutoConnectExchangeInput,
  ): Promise<AutoExchangeConnection> {
    return this.post<AutoExchangeConnection>("/exchanges", input);
  }

  public disconnectExchange(
    exchange: TradableExchange,
  ): Promise<{ success: true }> {
    return this.delete<{ success: true }>(`/exchanges/${exchange}`);
  }

  public validateSymbol(
    exchange: TradableExchange,
    symbol: string,
  ): Promise<AutoValidateSymbolResponse> {
    return this.get<AutoValidateSymbolResponse>(
      `/validate-symbol/${exchange}/${encodeURIComponent(symbol)}`,
    );
  }

  public streamQuery(
    queryId: string,
    signal?: AbortSignal,
  ): AsyncGenerator<AutoStreamEvent> {
    return this.stream(`/queries/${queryId}/stream`, signal);
  }

  public streamAll(signal?: AbortSignal): AsyncGenerator<AutoStreamEvent> {
    return this.stream("/queries/stream", signal);
  }

  private async get<T>(path: string, params?: object): Promise<T> {
    return this.httpClient.get<T>(`${MOUNT}${path}${query(params)}`);
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const bodyStr = body === undefined ? "" : JSON.stringify(body);
    const headers = this.sign("POST", path, bodyStr);
    return this.httpClient.post<T>(
      `${MOUNT}${path}`,
      body === undefined ? undefined : bodyStr,
      headers ? { headers } : undefined,
    );
  }

  private async delete<T>(path: string): Promise<T> {
    const headers = this.sign("DELETE", path, "");
    return this.httpClient.delete<T>(
      `${MOUNT}${path}`,
      headers ? { headers } : undefined,
    );
  }

  private sign(
    method: string,
    path: string,
    body: string,
  ): Record<string, string> | undefined {
    if (!this.hmacSecret) return undefined;
    return signRequest(this.hmacSecret, method, path, body);
  }

  private async *stream(
    path: string,
    signal?: AbortSignal,
  ): AsyncGenerator<AutoStreamEvent> {
    const response = await fetch(`${this.baseUrl}${MOUNT}${path}`, {
      headers: {
        ...this.headers,
        "x-elfa-api-key": this.apiKey,
        Accept: "text/event-stream",
      },
      ...(signal ? { signal } : {}),
    });

    if (!response.ok) {
      await throwForFetchResponse(response);
    }
    if (!response.body) {
      throw new NetworkError("Auto stream returned no response body");
    }

    try {
      for await (const message of readSSE(response.body)) {
        let data: Record<string, unknown> = {};
        try {
          data = message.data ? JSON.parse(message.data) : {};
        } catch {
          data = { raw: message.data };
        }
        const event: AutoStreamEvent = {
          event: message.event ?? "message",
          data,
        };
        if (message.id !== undefined) event.id = message.id;
        yield event;
        if (message.event === "end") return;
      }
    } finally {
      await response.body.cancel().catch(() => {});
    }
  }
}

function query(params?: object): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}
