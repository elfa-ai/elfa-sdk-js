import { HttpClient } from "../utils/http.js";
import { signRequest } from "../utils/hmac.js";
import type {
  PlaceOrderInput,
  CancelOrderInput,
  ModifyOrderInput,
  ClosePositionInput,
  SetPositionTpslInput,
  TradeResultResponse,
  TradePreviewResponse,
} from "../types/trade.js";

export interface TradeClientOptions {
  apiKey: string;
  baseUrl?: string;
  hmacSecret?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  debug?: boolean;
}

const MOUNT = "/v2/trade";

export class TradeClient {
  private httpClient: HttpClient;
  private hmacSecret?: string;

  constructor(options: TradeClientOptions) {
    if (options.hmacSecret) this.hmacSecret = options.hmacSecret;

    this.httpClient = new HttpClient({
      baseURL: options.baseUrl ?? "https://api.elfa.ai",
      timeout: options.timeout ?? 30000,
      retries: options.retries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      ...(options.headers ? { headers: options.headers } : {}),
      debug: options.debug ?? false,
    });
    this.httpClient.setAuthHeader(options.apiKey);
  }

  public previewOrder(input: PlaceOrderInput): Promise<TradePreviewResponse> {
    return this.post("/orders/preview", input);
  }

  public placeOrder(input: PlaceOrderInput): Promise<TradeResultResponse> {
    return this.post("/orders", input);
  }

  public cancelOrder(input: CancelOrderInput): Promise<TradeResultResponse> {
    return this.post("/orders/cancel", input);
  }

  public modifyOrder(input: ModifyOrderInput): Promise<TradeResultResponse> {
    return this.post("/orders/modify", input);
  }

  public previewClosePosition(
    input: ClosePositionInput,
  ): Promise<TradePreviewResponse> {
    return this.post("/positions/close/preview", input);
  }

  public closePosition(
    input: ClosePositionInput,
  ): Promise<TradeResultResponse> {
    return this.post("/positions/close", input);
  }

  public previewSetPositionTpsl(
    input: SetPositionTpslInput,
  ): Promise<TradePreviewResponse> {
    return this.post("/positions/tpsl/preview", input);
  }

  public setPositionTpsl(
    input: SetPositionTpslInput,
  ): Promise<TradeResultResponse> {
    return this.post("/positions/tpsl", input);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const bodyStr = JSON.stringify(body);
    const headers = this.sign("POST", path, bodyStr);
    return this.httpClient.post<T>(
      `${MOUNT}${path}`,
      bodyStr,
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
}
