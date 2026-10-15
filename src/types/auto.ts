export type AutoSpeed = "fast" | "expert" | "adaptive";

export type EqlOperator =
  ">" | "<" | ">=" | "<=" | "==" | "!=" | "crosses_above" | "crosses_below";

export type EqlConditionSource =
  | "price"
  | "ta"
  | "cron"
  | "llm"
  | "tweet"
  | "telegram"
  | "events"
  | "news"
  | "sec"
  | "kalshi"
  | "polymarket"
  | "funding"
  | "liquidation"
  | "fear_greed"
  | "x_follow_received"
  | "x_follow_made"
  | "x_follow_overlap";

export type EqlActionType = "webhook" | "notify" | "telegram_bot" | "llm";

export interface EqlConditionLeaf {
  source: EqlConditionSource;
  method?: string;
  args: Record<string, unknown>;
  operator?: EqlOperator;
  value?: string | number | boolean | Record<string, unknown>;
}

export type EqlConditionGroup =
  | { AND: Array<EqlConditionGroup | EqlConditionLeaf> }
  | { OR: Array<EqlConditionGroup | EqlConditionLeaf> };

export interface EqlActionStep {
  stepId: string;
  type: EqlActionType;
  params: Record<string, unknown>;
}

export interface EqlQuery {
  conditions: EqlConditionGroup;
  actions: EqlActionStep[];
  expiresIn: string;
  repeat?: { cooldown: string; maxTriggers: number };
}

export interface AutoChatParams {
  message: string;
  speed?: AutoSpeed;
  sessionId?: string;
}

export interface AutoChatResponse {
  sessionId: string;
  response: string;
  title: string | null;
  reasoning: string | null;
  planIds: string[];
  /**
   * Credits this call cost, same total as the `x-elfa-credits` response header.
   * Optional because keys on older API deployments do not return it.
   */
  credits?: number;
}

export interface AutoQueryInput {
  query: EqlQuery;
  title?: string;
  description?: string;
}

export interface AutoTweetAccount {
  path: string;
  username: string;
  accountSourceRefId: string;
  billing: "included" | "per_post";
  creditsPerPost?: number;
}

export interface AutoQueryFailure {
  code: string;
  message: string | null;
  source: string;
}

export interface AutoValidateResponse {
  valid: boolean;
  errors: Array<string | Record<string, unknown>>;
  warnings: Array<string | Record<string, unknown>>;
  estimatedCredits?: number | null;
  simulationLlmCallsEstimate?: Record<string, unknown>;
  tweetAccounts?: AutoTweetAccount[];
}

export interface AutoQuery {
  queryId?: string;
  id?: string;
  status?: string;
  estimatedCredits?: number | null;
  [key: string]: unknown;
}

export interface AutoCreateQueryResponse extends AutoQuery {
  id: string;
  status: string;
  tweetAccounts?: AutoTweetAccount[];
}

export interface AutoListQueriesParams {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AutoListQueriesResponse {
  queries?: AutoQuery[];
  data?: AutoQuery[];
  total?: number;
  limit?: number;
  offset?: number;
  pagination?: unknown;
}

export interface AutoPollQueryResponse {
  queryId: string;
  status: string;
  latestEvaluation: {
    evaluatedAt: string | null;
    wouldTriggerNow: boolean | null;
  } | null;
  executions: Array<{
    id: string;
    queryId: string;
    type: string;
    status: string;
    createdAt: string;
    error?: unknown;
  }>;
  credits?: number;
  failure?: AutoQueryFailure;
}

export interface AutoDraft {
  id?: string;
  title?: string;
  description?: string;
  query?: EqlQuery;
  status?: string;
  valid?: boolean;
  visibility?: "public" | "private";
  [key: string]: unknown;
}

export interface AutoUpsertDraftInput {
  id?: string;
  query: EqlQuery;
  title?: string;
  description?: string;
}

export interface AutoConvertDraftResponse {
  draftId: string;
  convertedAt: string;
  query: AutoQuery;
}

export interface AutoListDraftsResponse {
  drafts?: AutoDraft[];
  data?: AutoDraft[];
  total?: number;
  limit?: number;
  offset?: number;
  pagination?: unknown;
}

export interface AutoListSessionsResponse {
  queryId?: string;
  sessions: Array<{
    sessionId: string;
    status: string | null;
    executedAt: string;
  }>;
}

export interface AutoSession {
  sessionId: string;
  queryId: string;
  title: string | null;
  analysisType: string | null;
  createdAt: string;
  messages: Array<{
    query: string | null;
    response: string | null;
    status: string | null;
    analysisType: string | null;
    timestamp: string | null;
    trades: unknown[];
    highlightedText?: string;
  }>;
}

export interface AutoExecution {
  id?: string;
  status?: string;
  createdAt?: string;
  queryId?: string;
  type?: string;
  error?: unknown;
  [key: string]: unknown;
}

export interface AutoListExecutionsParams {
  queryId?: string;
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface AutoListExecutionsResponse {
  data: AutoExecution[];
  pagination?: unknown;
}

export type TradableExchange = "hyperliquid" | "binance";

export interface AutoValidateSymbolResponse {
  supported: "true" | "false";
}

export interface AutoStreamNotification {
  status: "triggered" | "stopped" | "ended" | "update";
  title: string;
  body: string;
  queryId: string;
  timestamp: number;
  executionId?: string;
  triggerTime?: string;
  conditionsMet?: unknown;
  autoDetails?: unknown;
}

export interface AutoStreamEvent {
  event: string;
  data: Record<string, unknown>;
  id?: string;
}
