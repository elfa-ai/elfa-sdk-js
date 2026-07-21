import { ElfaSDK } from "../client/ElfaSDK";
import { ElfaV2Client } from "../client/ElfaV2Client";
import { ValidationError } from "../utils/errors";

jest.mock("../client/ElfaV2Client");
jest.mock("../client/AutoClient");
jest.mock("../client/TradeClient");

describe("ElfaSDK", () => {
  let mockElfaClient: jest.Mocked<ElfaV2Client>;

  beforeEach(() => {
    mockElfaClient = {
      ping: jest.fn(),
      getApiKeyStatus: jest.fn(),
      getTrendingTokens: jest.fn(),
      getAccountSmartStats: jest.fn(),
      getKeywordMentions: jest.fn(),
      getTokenNews: jest.fn(),
      getTrendingCAsTwitter: jest.fn(),
      getTrendingCAsTelegram: jest.fn(),
      getTopMentions: jest.fn(),
      getEventSummary: jest.fn(),
      getTrendingNarratives: jest.fn(),
      chat: jest.fn(),
      testConnection: jest.fn(),
    } as any;

    (ElfaV2Client as jest.MockedClass<typeof ElfaV2Client>).mockImplementation(
      () => mockElfaClient,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("creates the client with defaults", () => {
      const sdk = new ElfaSDK({ elfaApiKey: "test-api-key" });

      expect(sdk).toBeInstanceOf(ElfaSDK);
      expect(sdk.auto).toBeDefined();
      expect(sdk.trade).toBeDefined();
      expect(ElfaV2Client).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: "test-api-key",
          baseUrl: "https://api.elfa.ai",
          timeout: 30000,
          debug: false,
        }),
      );
    });

    it("forwards hmacSecret when provided", () => {
      new ElfaSDK({ elfaApiKey: "k", hmacSecret: "secret" });
      expect(ElfaV2Client).toHaveBeenCalledWith(
        expect.objectContaining({ hmacSecret: "secret" }),
      );
    });

    it("throws when elfaApiKey is missing", () => {
      expect(() => new ElfaSDK({} as any)).toThrow(
        new ValidationError("elfaApiKey is required"),
      );
    });

    it("throws when timeout is below 1000ms", () => {
      expect(() => new ElfaSDK({ elfaApiKey: "k", timeout: 500 })).toThrow(
        new ValidationError("timeout must be at least 1000ms"),
      );
    });
  });

  describe("delegation", () => {
    let sdk: ElfaSDK;

    beforeEach(() => {
      sdk = new ElfaSDK({ elfaApiKey: "k" });
    });

    it("delegates getTrendingTokens", async () => {
      const response = { success: true, data: { data: [] } };
      mockElfaClient.getTrendingTokens.mockResolvedValue(response as any);

      const result = await sdk.getTrendingTokens({ timeWindow: "24h" });

      expect(mockElfaClient.getTrendingTokens).toHaveBeenCalledWith({
        timeWindow: "24h",
      });
      expect(result).toBe(response);
    });

    it("delegates getKeywordMentions", async () => {
      const response = { success: true, data: [] };
      mockElfaClient.getKeywordMentions.mockResolvedValue(response as any);

      const result = await sdk.getKeywordMentions({ keywords: "bitcoin" });

      expect(mockElfaClient.getKeywordMentions).toHaveBeenCalledWith({
        keywords: "bitcoin",
      });
      expect(result).toBe(response);
    });

    it("delegates getTopMentions", async () => {
      const response = { success: true, data: [], metadata: {} };
      mockElfaClient.getTopMentions.mockResolvedValue(response as any);

      const result = await sdk.getTopMentions({ ticker: "BTC" });

      expect(mockElfaClient.getTopMentions).toHaveBeenCalledWith({
        ticker: "BTC",
      });
      expect(result).toBe(response);
    });

    it("delegates getAccountSmartStats", async () => {
      const response = { success: true, data: {} };
      mockElfaClient.getAccountSmartStats.mockResolvedValue(response as any);

      await sdk.getAccountSmartStats({ username: "cz_binance" });

      expect(mockElfaClient.getAccountSmartStats).toHaveBeenCalledWith({
        username: "cz_binance",
      });
    });

    it("delegates getTrendingNarratives", async () => {
      const response = { success: true, data: { trending_narratives: [] } };
      mockElfaClient.getTrendingNarratives.mockResolvedValue(response as any);

      await sdk.getTrendingNarratives({ timeFrame: "day" });

      expect(mockElfaClient.getTrendingNarratives).toHaveBeenCalledWith({
        timeFrame: "day",
      });
    });

    it("delegates chat", async () => {
      const response = { success: true, data: { message: "hi" } };
      mockElfaClient.chat.mockResolvedValue(response as any);

      await sdk.chat({ message: "hello" });

      expect(mockElfaClient.chat).toHaveBeenCalledWith({ message: "hello" });
    });
  });

  describe("testConnection", () => {
    it("returns the elfa client result", async () => {
      const sdk = new ElfaSDK({ elfaApiKey: "k" });
      mockElfaClient.testConnection.mockResolvedValue(true);

      expect(await sdk.testConnection()).toBe(true);
    });

    it("returns false when the check throws", async () => {
      const sdk = new ElfaSDK({ elfaApiKey: "k" });
      mockElfaClient.testConnection.mockRejectedValue(new Error("boom"));

      expect(await sdk.testConnection()).toBe(false);
    });
  });

  describe("options", () => {
    it("updateOptions rejects elfaApiKey changes", () => {
      const sdk = new ElfaSDK({ elfaApiKey: "k" });
      expect(() => sdk.updateOptions({ elfaApiKey: "other" })).toThrow(
        "Cannot update elfaApiKey after initialization",
      );
    });

    it("updateOptions merges other options", () => {
      const sdk = new ElfaSDK({ elfaApiKey: "k" });
      sdk.updateOptions({ debug: true });
      expect(sdk.getOptions().debug).toBe(true);
    });
  });
});
