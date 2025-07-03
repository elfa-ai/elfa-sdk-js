import { TwitterClient } from "../client/TwitterClient";
import { HttpClient } from "../utils/http";
import { TwitterApiError } from "../utils/errors";

// Mock the HttpClient
jest.mock("../utils/http");

describe("TwitterClient", () => {
  let client: TwitterClient;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      setAuthHeader: jest.fn(),
      setTwitterAuthHeader: jest.fn(),
      request: jest.fn(),
    } as any;

    (HttpClient as jest.MockedClass<typeof HttpClient>).mockImplementation(
      () => mockHttpClient,
    );

    client = new TwitterClient({
      bearerToken: "test-bearer-token",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create client with default options", () => {
      expect(HttpClient).toHaveBeenCalledWith({
        baseURL: "https://api.x.com/2",
        timeout: 30000,
        retries: 3,
      });
      expect(mockHttpClient.setTwitterAuthHeader).toHaveBeenCalledWith(
        "test-bearer-token",
      );
    });

    it("should create client with custom options", () => {
      new TwitterClient({
        bearerToken: "test-token",
        baseUrl: "https://custom.twitter.com",
        timeout: 5000,
        retries: 1,
      });

      expect(HttpClient).toHaveBeenCalledWith({
        baseURL: "https://custom.twitter.com/2",
        timeout: 5000,
        retries: 1,
      });
    });
  });

  describe("getTweets", () => {
    it("should fetch tweets successfully", async () => {
      const mockResponse = {
        data: [{ id: "1", text: "Test tweet", author_id: "user1" }],
        includes: {
          users: [{ id: "user1", username: "testuser" }],
        },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTweets({
        tweetIds: ["1", "2"],
        tweetFields: ["id", "text", "author_id"],
        userFields: ["id", "username"],
        expansions: ["author_id"],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/tweets?ids=1%2C2&tweet.fields=id%2Ctext%2Cauthor_id&user.fields=id%2Cusername&expansions=author_id",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should return empty data for empty tweet IDs", async () => {
      const result = await client.getTweets({ tweetIds: [] });

      expect(result).toEqual({ data: [] });
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it("should throw error for too many tweet IDs", async () => {
      const tweetIds = Array(101)
        .fill(0)
        .map((_, i) => i.toString());

      await expect(client.getTweets({ tweetIds })).rejects.toThrow(
        new TwitterApiError("Cannot fetch more than 100 tweets at once"),
      );
    });

    it("should handle Twitter API errors", async () => {
      const mockResponse = {
        data: [],
        errors: [{ title: "Not Found", detail: "Tweet not found" }],
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      await expect(client.getTweets({ tweetIds: ["invalid"] })).rejects.toThrow(
        "Failed to fetch tweets: Twitter API errors: Not Found",
      );
    });

    it("should handle HTTP errors", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Network error"));

      await expect(client.getTweets({ tweetIds: ["1"] })).rejects.toThrow(
        new TwitterApiError("Failed to fetch tweets: Network error"),
      );
    });
  });

  describe("getTweet", () => {
    it("should fetch single tweet successfully", async () => {
      const mockResponse = {
        data: { id: "1", text: "Test tweet", author_id: "user1" },
        includes: {
          users: [{ id: "user1", username: "testuser" }],
        },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTweet("1", {
        tweetFields: ["id", "text"],
        userFields: ["username"],
        expansions: ["author_id"],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/tweets/1?tweet.fields=id%2Ctext&user.fields=username&expansions=author_id",
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle Twitter API errors for single tweet", async () => {
      const mockResponse = {
        errors: [{ title: "Not Found", detail: "Tweet not found" }],
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      await expect(client.getTweet("invalid")).rejects.toThrow(
        "Failed to fetch tweet: Twitter API errors: Not Found",
      );
    });
  });

  describe("getUser", () => {
    it("should fetch user successfully", async () => {
      const mockResponse = {
        data: { id: "user1", username: "testuser", name: "Test User" },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getUser("user1", {
        userFields: ["id", "username", "name"],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/users/user1?user.fields=id%2Cusername%2Cname",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getUserByUsername", () => {
    it("should fetch user by username successfully", async () => {
      const mockResponse = {
        data: { id: "user1", username: "testuser", name: "Test User" },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getUserByUsername("testuser", {
        userFields: ["id", "username", "name"],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/users/by/username/testuser?user.fields=id%2Cusername%2Cname",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("testConnection", () => {
    it("should return true when connection test succeeds", async () => {
      mockHttpClient.get.mockResolvedValue({ data: {} });

      const result = await client.testConnection();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/tweets/by/username/twitter",
        {
          timeout: 10000,
        },
      );
      expect(result).toBe(true);
    });

    it("should return false when connection test fails", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Network error"));

      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });

  describe("getRateLimitInfo", () => {
    it("should call rate limit endpoint", async () => {
      const mockResponse = { resources: {} };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getRateLimitInfo();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/application/rate_limit_status",
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
