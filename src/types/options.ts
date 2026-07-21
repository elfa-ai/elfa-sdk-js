export interface SDKOptions {
  elfaApiKey: string;
  hmacSecret?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  debug?: boolean;
}
