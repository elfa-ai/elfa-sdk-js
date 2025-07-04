import { HttpClient } from "../utils/http.js";
import type {
  TwitterApiResponse,
  TwitterTweet,
  TwitterUser,
  TwitterBatchRequest,
  TwitterClientOptions,
} from "../types/twitter.js";
import { TwitterApiError } from "../utils/errors.js";

export class TwitterClient {
  private httpClient: HttpClient;
  private options: TwitterClientOptions;

  constructor(options: TwitterClientOptions) {
    this.options = {
      apiVersion: "2",
      baseUrl: "https://api.x.com",
      timeout: 30000,
      retries: 3,
      ...options,
    };

    const httpOptions: any = {
      baseURL: `${this.options.baseUrl}/${this.options.apiVersion}`,
    };

    if (this.options.timeout !== undefined) {
      httpOptions.timeout = this.options.timeout;
    }

    if (this.options.retries !== undefined) {
      httpOptions.retries = this.options.retries;
    }

    this.httpClient = new HttpClient(httpOptions);

    this.httpClient.setTwitterAuthHeader(this.options.bearerToken);
  }

  public async getTweets(
    request: TwitterBatchRequest,
  ): Promise<TwitterApiResponse<TwitterTweet[]>> {
    if (request.tweetIds.length === 0) {
      return { data: [] };
    }

    if (request.tweetIds.length > 100) {
      throw new TwitterApiError("Cannot fetch more than 100 tweets at once");
    }

    const params = new URLSearchParams();
    params.append("ids", request.tweetIds.join(","));

    if (request.tweetFields?.length) {
      params.append("tweet.fields", request.tweetFields.join(","));
    }

    if (request.userFields?.length) {
      params.append("user.fields", request.userFields.join(","));
    }

    if (request.expansions?.length) {
      params.append("expansions", request.expansions.join(","));
    }

    try {
      const response = await this.httpClient.get<
        TwitterApiResponse<TwitterTweet[]>
      >(`/tweets?${params.toString()}`);

      if (response.errors?.length) {
        const errorMessages = response.errors.map((e) => e.title).join(", ");
        throw new TwitterApiError(
          `Twitter API errors: ${errorMessages}`,
          undefined,
          response.errors,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof TwitterApiError) {
        throw error;
      }
      throw new TwitterApiError(
        `Failed to fetch tweets: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }

  public async getTweet(
    tweetId: string,
    options: {
      tweetFields?: string[];
      userFields?: string[];
      expansions?: string[];
    } = {},
  ): Promise<TwitterApiResponse<TwitterTweet>> {
    const params = new URLSearchParams();

    if (options.tweetFields?.length) {
      params.append("tweet.fields", options.tweetFields.join(","));
    }

    if (options.userFields?.length) {
      params.append("user.fields", options.userFields.join(","));
    }

    if (options.expansions?.length) {
      params.append("expansions", options.expansions.join(","));
    }

    try {
      const response = await this.httpClient.get<
        TwitterApiResponse<TwitterTweet>
      >(`/tweets/${tweetId}?${params.toString()}`);

      if (response.errors?.length) {
        const errorMessages = response.errors.map((e) => e.title).join(", ");
        throw new TwitterApiError(
          `Twitter API errors: ${errorMessages}`,
          undefined,
          response.errors,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof TwitterApiError) {
        throw error;
      }
      throw new TwitterApiError(
        `Failed to fetch tweet: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }

  public async getUser(
    userId: string,
    options: {
      userFields?: string[];
      expansions?: string[];
    } = {},
  ): Promise<TwitterApiResponse<TwitterUser>> {
    const params = new URLSearchParams();

    if (options.userFields?.length) {
      params.append("user.fields", options.userFields.join(","));
    }

    if (options.expansions?.length) {
      params.append("expansions", options.expansions.join(","));
    }

    try {
      const response = await this.httpClient.get<
        TwitterApiResponse<TwitterUser>
      >(`/users/${userId}?${params.toString()}`);

      if (response.errors?.length) {
        const errorMessages = response.errors.map((e) => e.title).join(", ");
        throw new TwitterApiError(
          `Twitter API errors: ${errorMessages}`,
          undefined,
          response.errors,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof TwitterApiError) {
        throw error;
      }
      throw new TwitterApiError(
        `Failed to fetch user: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }

  public async getUserByUsername(
    username: string,
    options: {
      userFields?: string[];
      expansions?: string[];
    } = {},
  ): Promise<TwitterApiResponse<TwitterUser>> {
    const params = new URLSearchParams();

    if (options.userFields?.length) {
      params.append("user.fields", options.userFields.join(","));
    }

    if (options.expansions?.length) {
      params.append("expansions", options.expansions.join(","));
    }

    try {
      const response = await this.httpClient.get<
        TwitterApiResponse<TwitterUser>
      >(`/users/by/username/${username}?${params.toString()}`);

      if (response.errors?.length) {
        const errorMessages = response.errors.map((e) => e.title).join(", ");
        throw new TwitterApiError(
          `Twitter API errors: ${errorMessages}`,
          undefined,
          response.errors,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof TwitterApiError) {
        throw error;
      }
      throw new TwitterApiError(
        `Failed to fetch user by username: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.httpClient.get(
        "/tweets/by/username/twitter",
        {
          timeout: 10000,
        },
      );
      return !!response;
    } catch {
      return false;
    }
  }

  public getRateLimitInfo(): Promise<any> {
    return this.httpClient.get("/application/rate_limit_status");
  }
}
