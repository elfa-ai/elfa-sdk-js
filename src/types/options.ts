export interface SDKOptions {
  /** Your Elfa API key, sent as `x-elfa-api-key`. Set this or `accessToken`. */
  elfaApiKey?: string;
  /**
   * An OAuth access token for the Elfa API, sent as
   * `Authorization: Bearer <token>`, instead of an API key. Set this or
   * `elfaApiKey`, not both. Set at construction only: build a new client when
   * the token is renewed.
   */
  accessToken?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  /**
   * Your product name and version, appended to the SDK's User-Agent, e.g.
   * `"my-bot/1.2"` gives `elfa-sdk-js/<version> my-bot/1.2`. Printable
   * ASCII, at most 100 characters. Set at construction only.
   */
  appName?: string;
  debug?: boolean;
}
