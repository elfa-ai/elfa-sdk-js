import axios, { AxiosError } from 'axios';
import { HttpClient } from '../utils/http';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      defaults: {
        headers: {
          common: {}
        }
      },
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      }
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    httpClient = new HttpClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
      retries: 2
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        timeout: 5000,
        headers: {
          'User-Agent': '@elfa-ai/sdk/2.0.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    });

    it('should setup interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('request', () => {
    it('should make successful request', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await httpClient.request({ url: '/test' });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({ url: '/test' });
      expect(result).toEqual({ success: true });
    });

    it('should retry on retryable errors', async () => {
      const { NetworkError } = require('../utils/errors');
      const mockError = new NetworkError('Network error');
      
      mockAxiosInstance.request
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue({ data: { success: true } });

      const result = await httpClient.request({ url: '/test', retries: 2 });

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    it('should throw error after max retries', async () => {
      const { NetworkError } = require('../utils/errors');
      const mockError = new NetworkError('Persistent error');
      mockAxiosInstance.request.mockRejectedValue(mockError);

      await expect(httpClient.request({ url: '/test', retries: 1 }))
        .rejects.toThrow('Persistent error');

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      jest.spyOn(httpClient, 'request').mockResolvedValue({ data: 'test' });
    });

    it('should call GET request', async () => {
      await httpClient.get('/test');
      expect(httpClient.request).toHaveBeenCalledWith({ method: 'GET', url: '/test' });
    });

    it('should call POST request', async () => {
      await httpClient.post('/test', { data: 'test' });
      expect(httpClient.request).toHaveBeenCalledWith({ 
        method: 'POST', 
        url: '/test', 
        data: { data: 'test' } 
      });
    });

    it('should call PUT request', async () => {
      await httpClient.put('/test', { data: 'test' });
      expect(httpClient.request).toHaveBeenCalledWith({ 
        method: 'PUT', 
        url: '/test', 
        data: { data: 'test' } 
      });
    });

    it('should call DELETE request', async () => {
      await httpClient.delete('/test');
      expect(httpClient.request).toHaveBeenCalledWith({ method: 'DELETE', url: '/test' });
    });
  });

  describe('authentication headers', () => {
    it('should set Elfa auth header', () => {
      httpClient.setAuthHeader('test-api-key');
      expect(mockAxiosInstance.defaults.headers.common['x-elfa-api-key'])
        .toBe('test-api-key');
    });

    it('should set Twitter auth header', () => {
      httpClient.setTwitterAuthHeader('test-bearer-token');
      expect(mockAxiosInstance.defaults.headers.common['Authorization'])
        .toBe('Bearer test-bearer-token');
    });
  });

  describe('error handling', () => {
    let handleResponseError: (error: AxiosError) => Promise<never>;

    beforeEach(() => {
      // Get the error handler from the response interceptor
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      handleResponseError = interceptorCall[1];
    });

    it('should throw AuthenticationError for 401 status', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Unauthorized'
      } as unknown as AxiosError;

      try {
        await handleResponseError(axiosError);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.name).toBe('AuthenticationError');
        expect(error.code).toBe('AUTHENTICATION_ERROR');
      }
    });

    it('should throw RateLimitError for 429 status', async () => {
      const axiosError = {
        response: {
          status: 429,
          data: { message: 'Rate limited' },
          headers: {
            'x-ratelimit-reset': '1640995200'
          }
        },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Rate limited'
      } as unknown as AxiosError;

      try {
        await handleResponseError(axiosError);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.name).toBe('RateLimitError');
        expect(error.code).toBe('RATE_LIMIT_ERROR');
      }
    });

    it('should throw ElfaApiError for other HTTP errors', async () => {
      const axiosError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Internal server error'
      } as unknown as AxiosError;

      try {
        await handleResponseError(axiosError);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.name).toBe('ElfaApiError');
        expect(error.code).toBe('ELFA_API_ERROR');
      }
    });

    it('should throw NetworkError for request errors', async () => {
      const axiosError = {
        request: {},
        message: 'Network Error',
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError'
      } as unknown as AxiosError;

      try {
        await handleResponseError(axiosError);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.name).toBe('NetworkError');
        expect(error.code).toBe('NETWORK_ERROR');
      }
    });

    it('should extract error message from various response formats', async () => {
      const testCases = [
        { data: 'String error', expected: 'String error' },
        { data: { message: 'Object with message' }, expected: 'Object with message' },
        { data: { error: 'Object with error' }, expected: 'Object with error' },
        { data: { detail: 'Object with detail' }, expected: 'Object with detail' },
        { data: {}, expected: 'API request failed' },
        { data: null, expected: 'Unknown API error' }
      ];

      for (const testCase of testCases) {
        const axiosError = {
          response: {
            status: 400,
            data: testCase.data
          },
          isAxiosError: true,
          toJSON: () => ({}),
          name: 'AxiosError',
          message: 'Test error'
        } as unknown as AxiosError;

        try {
          await handleResponseError(axiosError);
        } catch (error: any) {
          expect(error.message).toBe(testCase.expected);
        }
      }
    });

    it('should parse rate limit reset time', async () => {
      const axiosError = {
        response: {
          status: 429,
          data: { message: 'Rate limited' },
          headers: {
            'retry-after': '60'
          }
        },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Rate limited'
      } as unknown as AxiosError;

      try {
        await handleResponseError(axiosError);
      } catch (error: any) {
        expect(error.resetTime).toBeInstanceOf(Date);
      }
    });
  });
});