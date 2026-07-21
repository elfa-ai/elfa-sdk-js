export interface SDKOptions {
  elfaApiKey: string;
  hmacSecret?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  debug?: boolean;
}
