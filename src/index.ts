import { ElfaSDK } from "./client/ElfaSDK.js";

export { ElfaSDK } from "./client/ElfaSDK.js";
export { ElfaV2Client } from "./client/ElfaV2Client.js";
export { TwitterClient } from "./client/TwitterClient.js";

export {
  V1CompatibilityLayer,
  createV1CompatibleClient,
} from "./compatibility/v1.js";

export * from "./types/index.js";

export * from "./utils/errors.js";
export { PaginationHelper } from "./utils/pagination.js";

export type {
  SDKOptions,
  RequestOptions,
  EnhancementOptions,
  EnhancedResponse,
} from "./types/enhanced.js";

export type {
  TrendingTokensParams,
  KeywordMentionsParams,
  TokenNewsParams,
  TrendingCAsParams,
  AccountSmartStatsParams,
  TopMentionsParams,
  MentionsByKeywordsParams,
  MentionsParams,
} from "./types/elfa.js";

export type {
  TwitterClientOptions,
  TwitterBatchRequest,
} from "./types/twitter.js";

export default ElfaSDK;
