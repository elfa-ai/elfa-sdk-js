import {
  ElfaSDKError,
  ElfaApiError,
  TwitterApiError,
  ValidationError,
  RateLimitError,
  AuthenticationError,
  NetworkError,
  EnhancementError,
  isRetryableError,
  getErrorMessage
} from '../utils/errors';

describe('Error Classes', () => {
  describe('ElfaSDKError', () => {
    it('should create error with message and code', () => {
      const error = new ElfaSDKError('Test error', 'TEST_CODE');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ElfaSDKError);
      expect(error.name).toBe('ElfaSDKError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with status code and details', () => {
      const details = { field: 'value' };
      const error = new ElfaSDKError('Test error', 'TEST_CODE', 400, details);
      
      expect(error.statusCode).toBe(400);
      expect(error.details).toBe(details);
    });
  });

  describe('ElfaApiError', () => {
    it('should create API error with status code', () => {
      const error = new ElfaApiError('API failed', 500);
      
      expect(error).toBeInstanceOf(ElfaSDKError);
      expect(error.name).toBe('ElfaApiError');
      expect(error.code).toBe('ELFA_API_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('TwitterApiError', () => {
    it('should create Twitter API error', () => {
      const error = new TwitterApiError('Twitter failed', 429);
      
      expect(error).toBeInstanceOf(ElfaSDKError);
      expect(error.name).toBe('TwitterApiError');
      expect(error.code).toBe('TWITTER_API_ERROR');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error).toBeInstanceOf(ElfaSDKError);
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with reset time', () => {
      const resetTime = new Date();
      const error = new RateLimitError('Rate limited', resetTime);
      
      expect(error).toBeInstanceOf(ElfaSDKError);
      expect(error.name).toBe('RateLimitError');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.resetTime).toBe(resetTime);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError();
      
      expect(error).toBeInstanceOf(ElfaSDKError);
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication failed');
    });

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Invalid API key');
      
      expect(error.message).toBe('Invalid API key');
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const originalError = new Error('Connection failed');
      const error = new NetworkError('Network issue', originalError);
      
      expect(error).toBeInstanceOf(ElfaSDKError);
      expect(error.name).toBe('NetworkError');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.details).toBe(originalError);
    });
  });

  describe('EnhancementError', () => {
    it('should create enhancement error', () => {
      const error = new EnhancementError('Enhancement failed');
      
      expect(error).toBeInstanceOf(ElfaSDKError);
      expect(error.name).toBe('EnhancementError');
      expect(error.code).toBe('ENHANCEMENT_ERROR');
    });
  });
});

describe('Error Utility Functions', () => {
  describe('isRetryableError', () => {
    it('should return true for retryable errors', () => {
      expect(isRetryableError(new RateLimitError('Rate limited'))).toBe(true);
      expect(isRetryableError(new NetworkError('Network failed'))).toBe(true);
      expect(isRetryableError(new ElfaApiError('Server error', 500))).toBe(true);
      expect(isRetryableError(new ElfaApiError('Bad gateway', 502))).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError(new ValidationError('Invalid input'))).toBe(false);
      expect(isRetryableError(new AuthenticationError())).toBe(false);
      expect(isRetryableError(new ElfaApiError('Bad request', 400))).toBe(false);
      expect(isRetryableError(new Error('Generic error'))).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return error message for Error objects', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should return string for string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown errors', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
      expect(getErrorMessage({})).toBe('An unknown error occurred');
    });
  });
});