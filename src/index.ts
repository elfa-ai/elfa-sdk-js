import { ElfaSDK } from "./client/ElfaSDK.js";

export { ElfaSDK } from "./client/ElfaSDK.js";
export { ElfaV2Client } from "./client/ElfaV2Client.js";
export { AutoClient } from "./client/AutoClient.js";
export { TradeClient } from "./client/TradeClient.js";

export * from "./types/index.js";

export * from "./utils/errors.js";
export { PaginationHelper } from "./utils/pagination.js";

export type { SDKOptions } from "./types/options.js";

export type {
  TrendingTokensParams,
  KeywordMentionsParams,
  TokenNewsParams,
  TrendingCAsParams,
  AccountSmartStatsParams,
  TopMentionsV2Params,
  TrendingNarrativesParams,
} from "./types/elfa.js";

export default ElfaSDK;
