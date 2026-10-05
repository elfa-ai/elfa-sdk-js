export interface SDKOptions {
  elfaApiKey: string;
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
