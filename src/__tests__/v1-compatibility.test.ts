import { V1CompatibilityLayer } from "../compatibility/v1";

describe("V1CompatibilityLayer", () => {
  let v1Client: V1CompatibilityLayer;

  beforeEach(() => {
    v1Client = new V1CompatibilityLayer({
      elfaApiKey: "test-api-key",
      twitterApiKey: "test-twitter-key",
      enableV1Behavior: true,
    });
  });

  describe("constructor", () => {
    it("should create V1 compatibility layer with V1 behavior enabled", () => {
      expect(v1Client).toBeInstanceOf(V1CompatibilityLayer);
      expect(v1Client.isTwitterEnabled()).toBe(true);
    });

    it("should create with V1 behavior disabled", () => {
      const client = new V1CompatibilityLayer({
        elfaApiKey: "test-api-key",
        enableV1Behavior: false,
        fetchRawTweets: false,
      });

      expect(client).toBeInstanceOf(V1CompatibilityLayer);
    });
  });

  describe("legacy method signatures", () => {
    it("should handle getTopMentions with legacy parameters", async () => {
      const mockResponse = {
        success: true,
        data: {
          pageSize: 10,
          page: 1,
          total: 100,
          data: [],
        },
      };

      const mockSDK = jest
        .spyOn(v1Client.getSDK(), "getTopMentions")
        .mockResolvedValue(mockResponse);

      await v1Client.getTopMentions({
        ticker: "bitcoin",
        timeWindow: "24h",
        fetchRawTweets: true,
      });

      expect(mockSDK).toHaveBeenCalledWith({
        ticker: "bitcoin",
        timeWindow: "24h",
        fetchRawTweets: true,
      });
    });

    it("should handle getMentionsByKeywords with legacy parameters", async () => {
      const mockResponse = {
        success: true,
        data: [],
        metadata: { total: 0 },
      };

      const mockSDK = jest
        .spyOn(v1Client.getSDK(), "getMentionsByKeywords")
        .mockResolvedValue(mockResponse);

      await v1Client.getMentionsByKeywords({
        keywords: "bitcoin,ethereum",
        from: 1640995200,
        to: 1641081600,
        fetchRawTweets: true,
      });

      expect(mockSDK).toHaveBeenCalledWith({
        keywords: "bitcoin,ethereum",
        from: 1640995200,
        to: 1641081600,
        fetchRawTweets: true,
      });
    });

    it("should handle getTrendingTokens with legacy parameters", async () => {
      const mockResponse = {
        success: true,
        data: {
          pageSize: 10,
          page: 1,
          total: 100,
          data: [],
        },
      };

      const mockSDK = jest
        .spyOn(v1Client.getSDK(), "getTrendingTokens")
        .mockResolvedValue(mockResponse);

      await v1Client.getTrendingTokens({
        timeWindow: "24h",
        pageSize: 20,
      });

      expect(mockSDK).toHaveBeenCalledWith({
        timeWindow: "24h",
        pageSize: 20,
      });
    });
  });

  describe("V1 behavior settings", () => {
    it("should use enableV1Behavior as default for fetchRawTweets", async () => {
      const mockSDK = jest
        .spyOn(v1Client.getSDK(), "getTopMentions")
        .mockResolvedValue({} as any);

      await v1Client.getTopMentions({
        ticker: "bitcoin",
      });

      expect(mockSDK).toHaveBeenCalledWith({
        ticker: "bitcoin",
        fetchRawTweets: true,
      });
    });

    it("should allow override of fetchRawTweets parameter", async () => {
      const mockSDK = jest
        .spyOn(v1Client.getSDK(), "getTopMentions")
        .mockResolvedValue({} as any);

      await v1Client.getTopMentions({
        ticker: "bitcoin",
        fetchRawTweets: false,
      });

      expect(mockSDK).toHaveBeenCalledWith({
        ticker: "bitcoin",
        fetchRawTweets: false,
      });
    });
  });

  describe("utility methods", () => {
    it("should test connection", async () => {
      const mockSDK = jest
        .spyOn(v1Client.getSDK(), "testConnection")
        .mockResolvedValue({ elfa: true, twitter: true });

      const result = await v1Client.testConnection();

      expect(result).toBe(true);
      expect(mockSDK).toHaveBeenCalled();
    });

    it("should handle connection test failure", async () => {
      jest.spyOn(v1Client.getSDK(), "testConnection").mockResolvedValue({
        elfa: false,
        twitter: false,
      });

      const result = await v1Client.testConnection();

      expect(result).toBe(false);
    });

    it("should check if Twitter is enabled", () => {
      const result = v1Client.isTwitterEnabled();
      expect(result).toBe(true);
    });

    it("should provide access to underlying SDK", () => {
      const sdk = v1Client.getSDK();
      expect(sdk).toBeDefined();
      expect(typeof sdk.getTrendingTokens).toBe("function");
    });
  });

  describe("ping method", () => {
    it("should transform ping response format", async () => {
      const mockSDK = jest.spyOn(v1Client.getSDK(), "ping").mockResolvedValue({
        success: true,
        data: { message: "API is healthy" },
      });

      const result = await v1Client.ping();

      expect(result).toEqual({
        success: true,
        message: "API is healthy",
      });
      expect(mockSDK).toHaveBeenCalled();
    });
  });
});
