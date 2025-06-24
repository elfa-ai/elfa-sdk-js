import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { 
  ElfaApiError, 
  NetworkError, 
  RateLimitError, 
  AuthenticationError,
  isRetryableError 
} from './errors.js';

export interface HttpClientOptions {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  debug?: boolean;
}

export interface RequestConfig extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private client: AxiosInstance;
  private options: HttpClientOptions;

  constructor(options: HttpClientOptions) {
    this.options = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      debug: false,
      ...options
    };

    const clientConfig: any = {
      baseURL: this.options.baseURL,
      headers: {
        'User-Agent': '@elfa-ai/sdk/2.0.2',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    
    if (this.options.timeout !== undefined) {
      clientConfig.timeout = this.options.timeout;
    }
    
    this.client = axios.create(clientConfig);

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        if (this.options.debug) {
          console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data
          });
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        if (this.options.debug) {
          console.log(`[HTTP] ${response.status} ${response.config.url}`, {
            data: response.data
          });
        }
        return response;
      },
      (error) => this.handleResponseError(error)
    );
  }

  private handleResponseError(error: AxiosError): Promise<never> {
    if (error.response) {
      const { status, data } = error.response;
      const message = this.extractErrorMessage(data);

      if (status === 401) {
        throw new AuthenticationError(message);
      }

      if (status === 429) {
        const resetTime = this.extractRateLimitReset(error.response);
        throw new RateLimitError(message, resetTime, data);
      }

      throw new ElfaApiError(message, status, data);
    }

    if (error.request) {
      throw new NetworkError(`Network error: ${error.message}`, error);
    }

    throw new NetworkError(`Request setup error: ${error.message}`, error);
  }

  private extractErrorMessage(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      return data.message || data.error || data.detail || 'API request failed';
    }

    return 'Unknown API error';
  }

  private extractRateLimitReset(response: AxiosResponse): Date | undefined {
    const resetHeader = response.headers['x-ratelimit-reset'] || 
                       response.headers['retry-after'];
    
    if (resetHeader) {
      const resetTime = parseInt(resetHeader, 10);
      return new Date(resetTime * 1000);
    }

    return undefined;
  }

  public async request<T = any>(config: RequestConfig): Promise<T> {
    const maxRetries = config.retries ?? this.options.retries ?? 3;
    const retryDelay = config.retryDelay ?? this.options.retryDelay ?? 1000;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.request<T>(config);
        return response.data;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries || !isRetryableError(lastError)) {
          break;
        }

        if (this.options.debug) {
          console.log(`[HTTP] Retry attempt ${attempt + 1}/${maxRetries} after ${retryDelay}ms`);
        }

        await this.delay(retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError!;
  }

  public async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  public setAuthHeader(token: string): void {
    this.client.defaults.headers.common['x-elfa-api-key'] = token;
  }

  public setTwitterAuthHeader(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}