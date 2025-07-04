export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
    impression_count?: number;
    bookmark_count?: number;
  };
  referenced_tweets?: Array<{
    type: "retweeted" | "quoted" | "replied_to";
    id: string;
  }>;
  context_annotations?: Array<{
    domain: {
      id: string;
      name: string;
      description?: string;
    };
    entity: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
  attachments?: {
    media_keys?: string[];
    poll_ids?: string[];
  };
  geo?: {
    coordinates?: {
      type: string;
      coordinates: number[];
    };
    place_id?: string;
  };
  in_reply_to_user_id?: string;
  lang?: string;
  possibly_sensitive?: boolean;
  reply_settings?: "everyone" | "mentionedUsers" | "following";
  source?: string;
  withheld?: {
    copyright: boolean;
    country_codes: string[];
    scope?: "tweet" | "user";
  };
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  created_at?: string;
  description?: string;
  entities?: {
    url?: {
      urls: Array<{
        start: number;
        end: number;
        url: string;
        expanded_url: string;
        display_url: string;
      }>;
    };
    description?: {
      urls: Array<{
        start: number;
        end: number;
        url: string;
        expanded_url: string;
        display_url: string;
      }>;
      hashtags: Array<{
        start: number;
        end: number;
        tag: string;
      }>;
      mentions: Array<{
        start: number;
        end: number;
        username: string;
      }>;
      cashtags: Array<{
        start: number;
        end: number;
        tag: string;
      }>;
    };
  };
  location?: string;
  pinned_tweet_id?: string;
  profile_image_url?: string;
  protected?: boolean;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  url?: string;
  verified?: boolean;
  verified_type?: "blue" | "business" | "government";
  withheld?: {
    country_codes: string[];
    scope?: "tweet" | "user";
  };
}

export interface TwitterApiResponse<T> {
  data?: T;
  includes?: {
    tweets?: TwitterTweet[];
    users?: TwitterUser[];
    media?: any[];
    polls?: any[];
    places?: any[];
  };
  meta?: {
    oldest_id?: string;
    newest_id?: string;
    result_count?: number;
    next_token?: string;
    previous_token?: string;
  };
  errors?: TwitterApiErrorResponse[];
}

export interface TwitterApiErrorResponse {
  title: string;
  detail?: string;
  type: string;
  resource_type?: string;
  parameter?: string;
  resource_id?: string;
}

export interface TwitterClientOptions {
  bearerToken: string;
  apiVersion?: "2";
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface TwitterBatchRequest {
  tweetIds: string[];
  userFields?: string[];
  tweetFields?: string[];
  expansions?: string[];
}
