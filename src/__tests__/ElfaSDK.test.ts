import { ElfaSDK } from '../client/ElfaSDK';

describe('ElfaSDK', () => {
  describe('constructor', () => {
    it('should create SDK instance with valid options', () => {
      const sdk = new ElfaSDK({
        elfaApiKey: 'test-api-key'
      });

      expect(sdk).toBeInstanceOf(ElfaSDK);
      expect(sdk.isTwitterEnabled()).toBe(false);
    });

    it('should create SDK instance with Twitter API key', () => {
      const sdk = new ElfaSDK({
        elfaApiKey: 'test-api-key',
        twitterApiKey: 'test-twitter-key'
      });

      expect(sdk).toBeInstanceOf(ElfaSDK);
      expect(sdk.isTwitterEnabled()).toBe(true);
    });

    it('should throw ValidationError for missing elfaApiKey', () => {
      expect(() => {
        new ElfaSDK({} as any);
      }).toThrow('elfaApiKey is required');
    });

    it('should throw ValidationError for invalid maxBatchSize', () => {
      expect(() => {
        new ElfaSDK({
          elfaApiKey: 'test-api-key',
          maxBatchSize: 0
        });
      }).toThrow('maxBatchSize must be between 1 and 100');

      expect(() => {
        new ElfaSDK({
          elfaApiKey: 'test-api-key',
          maxBatchSize: 101
        });
      }).toThrow('maxBatchSize must be between 1 and 100');
    });

    it('should throw ValidationError for invalid enhancementTimeout', () => {
      expect(() => {
        new ElfaSDK({
          elfaApiKey: 'test-api-key',
          enhancementTimeout: 500
        });
      }).toThrow('enhancementTimeout must be at least 1000ms');
    });
  });

  describe('options management', () => {
    let sdk: ElfaSDK;

    beforeEach(() => {
      sdk = new ElfaSDK({
        elfaApiKey: 'test-api-key',
        fetchRawTweets: false,
        debug: false
      });
    });

    it('should return current options', () => {
      const options = sdk.getOptions();
      
      expect(options.elfaApiKey).toBe('test-api-key');
      expect(options.fetchRawTweets).toBe(false);
      expect(options.debug).toBe(false);
      expect(options.baseUrl).toBe('https://api.elfa.ai');
    });

    it('should update options', () => {
      sdk.updateOptions({
        fetchRawTweets: true,
        debug: true
      });

      const options = sdk.getOptions();
      expect(options.fetchRawTweets).toBe(true);
      expect(options.debug).toBe(true);
    });

    it('should not allow updating elfaApiKey', () => {
      expect(() => {
        sdk.updateOptions({
          elfaApiKey: 'new-key'
        });
      }).toThrow('Cannot update elfaApiKey after initialization');
    });

    it('should not allow updating twitterApiKey', () => {
      expect(() => {
        sdk.updateOptions({
          twitterApiKey: 'new-key'
        });
      }).toThrow('Cannot update twitterApiKey after initialization');
    });
  });

  describe('parameter validation', () => {
    let sdk: ElfaSDK;

    beforeEach(() => {
      sdk = new ElfaSDK({
        elfaApiKey: 'test-api-key'
      });
    });

    it('should validate trending tokens parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          pageSize: 10,
          page: 1,
          total: 100,
          data: []
        }
      };

      const mockElfaClient = jest.spyOn(sdk['elfaClient'], 'getTrendingTokens')
        .mockResolvedValue(mockResponse);

      await sdk.getTrendingTokens({
        timeWindow: '24h',
        page: 1,
        pageSize: 10
      });

      expect(mockElfaClient).toHaveBeenCalledWith({
        timeWindow: '24h',
        page: 1,
        pageSize: 10
      });
    });
  });
});

describe('ElfaSDK Integration', () => {
  let sdk: ElfaSDK;

  beforeEach(() => {
    sdk = new ElfaSDK({
      elfaApiKey: 'test-api-key',
      twitterApiKey: 'test-twitter-key'
    });
  });

  it('should handle fetchRawTweets parameter correctly', async () => {
    const mockResponse = {
      success: true,
      data: [],
      metadata: { total: 0 }
    };

    jest.spyOn(sdk['elfaClient'], 'getKeywordMentions')
      .mockResolvedValue(mockResponse);

    const enhancerSpy = jest.spyOn(sdk['enhancer'], 'enhanceProcessedMentions')
      .mockResolvedValue({
        data: [],
        enhancement_info: {
          total_enhanced: 0,
          failed_enhancements: 0,
          twitter_api_used: false
        }
      });

    await sdk.getKeywordMentions({
      keywords: 'bitcoin',
      fetchRawTweets: false
    });

    expect(enhancerSpy).not.toHaveBeenCalled();

    await sdk.getKeywordMentions({
      keywords: 'bitcoin',
      fetchRawTweets: true
    });

    expect(enhancerSpy).toHaveBeenCalled();
  });
});