import type { BillingMode } from "./elfa.js";

export type AssetClassV3 = "crypto" | "equity";

export type OrderV3 = "desc" | "asc";

export type EntityTypeV3 =
  "token" | "equity" | "project" | "person" | "organisation";

export type EventClassV3 = "market" | "asset" | "call";

export type EventTypeV3 =
  | "security"
  | "listing"
  | "regulatory"
  | "macro"
  | "protocol"
  | "company"
  | "marketFlow"
  | "price"
  | "social"
  | "spam"
  | "other";

export type EventCategoryV3 =
  | "earnings"
  | "analystRating"
  | "corporateAction"
  | "acquisition"
  | "financing"
  | "partnership"
  | "product"
  | "personnel"
  | "plansAndMilestones"
  | "ipo"
  | "exchangeListing"
  | "delisting"
  | "tokenLaunch"
  | "tokenomics"
  | "governance"
  | "flows"
  | "marketMove"
  | "metricsAndReports"
  | "economy"
  | "policy"
  | "legal"
  | "securityIncident"
  | "outage"
  | "geopolitics"
  | "disaster"
  | "commentary"
  | "forecast";

export type ImplicationV3 = "bullish" | "bearish" | "mixed" | "unclear";

export type AlertActionV3 = "alert" | "monitor";

export type NoveltyV3 = "new" | "update";

export type StorylineStatusV3 = "open" | "dormant";

export type StorylineRelationV3 =
  | "origin"
  | "update"
  | "confirmation"
  | "contradiction"
  | "mitigation"
  | "consequence"
  | "reaction"
  | "context";

export type ArcStatusV3 = "active" | "retired";

export type MatchedOnV3 =
  | "symbol"
  | "cashtag"
  | "name"
  | "alias"
  | "tickerRoot"
  | "exchangeSymbol"
  | "handle"
  | "contractAddress"
  | "externalId";

export type MindsharePeriodV3 = "1h" | "4h" | "24h" | "7d";

export type CallActionV3 =
  "open" | "reaffirm" | "add" | "trim" | "reverse" | "close" | "stopOut";

export type CallSetupV3 = "technical" | "momentum" | "fade" | "accumulation";

export type CallThesisV3 = "macro" | "narrative" | "event";

export type CallSourceKindV3 = "twitter" | "telegram";

export type CallDirectionV3 = "long" | "short";

export type CallHorizonV3 = "scalp" | "swing" | "position" | "unspecified";

export type CallStatusV3 = "open" | "closed";

export type CloseReasonV3 = "close" | "reverse" | "stopOut" | "expiry";

export type AccountMetricV3 =
  "standing" | "alphaScore" | "hitRate" | "avgReturn";

export type PlanV3 = "free" | "payg" | "grow" | "enterprise";

export interface PageV3 {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ServedPageV3 extends PageV3 {
  servedFrom: number | null;
}

export interface EntityMatchV3 {
  id: string;
  entityType: EntityTypeV3;
  name: string | null;
  symbol: string | null;
  handle: string | null;
  matchedOn: MatchedOnV3;
  score: number;
  externalIds: {
    coingeckoId: string | null;
    figi: string | null;
    cik: string | null;
  };
}

export interface EntitiesV3Params {
  q: string;
  entityType?: EntityTypeV3[];
  limit?: number;
  cursor?: string;
}

export interface EntitiesV3Response extends PageV3 {
  entities: EntityMatchV3[];
}

export interface EventEntityV3 {
  id: string;
  symbol: string | null;
  name: string | null;
  entityType: EntityTypeV3;
}

export interface EventImpactV3 {
  entityId: string;
  symbol: string;
  priceChange1d: number | null;
  movedFirst: boolean | null;
  marketWide: boolean | null;
  final: boolean;
}

export interface EventCitedSourceV3 {
  source: string;
  sourceRecordId: string;
  handle: string | null;
  link: string | null;
}

export interface EventV3 {
  id: string;
  eventClass: EventClassV3;
  alertTitle: string | null;
  summary: string | null;
  implication: ImplicationV3 | null;
  eventType: EventTypeV3 | null;
  eventCategory: EventCategoryV3 | (string & {}) | null;
  primaryEntities: EventEntityV3[];
  relatedEntities: EventEntityV3[];
  alertAction: AlertActionV3 | null;
  originCount: number;
  impacts: EventImpactV3[];
  analyzedAt: number;
  novelty: NoveltyV3;
  firstSeenAt: number | null;
  storylineId: string | null;
  citedSources: EventCitedSourceV3[];
  positions: {
    long: number;
    short: number;
    side: "long" | "short" | "mixed" | null;
  } | null;
}

export interface EventsV3Params {
  q?: string;
  from?: number;
  to?: number;
  eventIds?: string[];
  eventClass?: EventClassV3;
  eventType?: Exclude<EventTypeV3, "spam">;
  eventCategory?: EventCategoryV3[];
  implication?: ImplicationV3;
  entityIds?: string[];
  assetClass?: AssetClassV3;
  novelty?: NoveltyV3;
  alertAction?: AlertActionV3[];
  sort?: "latest" | "relevant";
  hasStoryline?: boolean;
  arcId?: string;
  notable?: boolean;
  order?: OrderV3;
  limit?: number;
  cursor?: string;
}

export interface EventsV3Response extends ServedPageV3 {
  events: EventV3[];
}

export interface StorylineV3 {
  id: string;
  title: string;
  summary: string;
  status: StorylineStatusV3;
  entities: EventEntityV3[];
  startedAt: number;
  lastEventAt: number;
  lastMaterialAt: number;
  arcId: string | null;
  events: Array<{
    eventId: string;
    relation: StorylineRelationV3;
    material: boolean;
    occurredAt: number;
  }>;
}

export interface StorylinesV3Params {
  q?: string;
  from?: number;
  to?: number;
  storylineIds?: string[];
  entityIds?: string[];
  status?: StorylineStatusV3 | "any";
  relation?: StorylineRelationV3[];
  order?: OrderV3;
  limit?: number;
  cursor?: string;
}

export interface StorylinesV3Response extends ServedPageV3 {
  storylines: StorylineV3[];
}

export interface ArcV3 {
  id: string;
  name: string;
  summary: string | null;
  status: ArcStatusV3;
  storylineIds: string[];
  updatedAt: number;
}

export interface ArcsV3Params {
  q?: string;
  arcIds?: string[];
  status?: ArcStatusV3;
  assetClass?: AssetClassV3;
  entityIds?: string[];
  sort?: "latest" | "storylines" | "events";
  order?: OrderV3;
  limit?: number;
  cursor?: string;
}

export interface ArcsV3Response extends PageV3 {
  arcs: ArcV3[];
}

export type RelatedKindV3 = "event" | "storyline" | "arc";

export type PredictionMarketProviderV3 = "polymarket" | "kalshi";

export interface PredictionMarketMoveV3 {
  eventId: string;
  outcomeId: string;
  outcome: string | null;
  before: number;
  after: number;
  unusual: boolean;
}

export interface PredictionMarketV3 {
  provider: PredictionMarketProviderV3;
  marketId: string;
  title: string;
  url: string;
  closesAt: number | null;
  eventIds: string[];
  move: PredictionMarketMoveV3 | null;
}

export interface PredictionMarketsV3Params {
  ids: string[];
  limit?: number;
}

export interface PredictionMarketsV3Response {
  related: Array<{
    id: string;
    kind: RelatedKindV3;
    markets: PredictionMarketV3[];
  }>;
}

export type CalendarCategoryV3 =
  | "macro"
  | "earnings"
  | "unlock"
  | "governance"
  | "listing"
  | "launch"
  | "airdrop"
  | "conference"
  | "regulatory"
  | "protocolUpgrade"
  | "corporateAction"
  | "marketResolution"
  | "campaign"
  | "expiry"
  | "deadline"
  | "geopolitics"
  | "other";

export type CalendarStatusV3 =
  "scheduled" | "rescheduled" | "postponed" | "cancelled" | "past" | "occurred";

export type CalendarConfidenceV3 = "official" | "reported" | "rumored";

export interface CalendarEntryV3 {
  id: string;
  title: string;
  summary: string | null;
  category: CalendarCategoryV3;
  startsAt: number;
  endsAt: number | null;
  precision: "exact" | "day";
  date: string | null;
  endDate: string | null;
  timezone: string | null;
  status: CalendarStatusV3;
  importance: number;
  confidence: CalendarConfidenceV3;
  entities: EventEntityV3[];
  eventIds: string[];
  storylineIds: string[];
  outcome: {
    eventId: string;
    implication: ImplicationV3 | null;
  } | null;
}

export interface CalendarV3Params {
  from?: number;
  to?: number;
  entityIds?: string[];
  assetClass?: AssetClassV3;
  category?: CalendarCategoryV3[];
  status?: CalendarStatusV3[];
  confidence?: CalendarConfidenceV3[];
  minImportance?: number;
  order?: OrderV3;
  limit?: number;
  cursor?: string;
}

export interface CalendarV3Response extends ServedPageV3 {
  entries: CalendarEntryV3[];
}

export interface CallBookBarV3 {
  barAt: number;
  live: boolean;
  longShare: number;
  shortShare: number;
  crowdingPercentile: number | null;
  accountCount: number;
  pulse24: number | null;
  pulse24LongShare: number | null;
  pulse6: number | null;
  pulse6LongShare: number | null;
  formulaVersion: string;
  computedAt: number;
}

export interface CallBookV3Params {
  from: number;
  to?: number;
  order?: OrderV3;
  limit?: number;
  cursor?: string;
}

export interface CallBookV3Response extends ServedPageV3 {
  bars: CallBookBarV3[];
}

export interface MindshareAssetV3 {
  rank: number;
  id: string;
  symbol: string | null;
  name: string | null;
  share: number;
  changePct: number | null;
  hot: boolean | null;
  share1h: number;
  share4h: number;
  ratio1h4h: number | null;
  capped1h: number;
}

export interface MindshareV3Params {
  period?: MindsharePeriodV3;
  to?: number;
  limit?: number;
  cursor?: string;
}

export interface MindshareV3Response extends PageV3 {
  assets: MindshareAssetV3[];
}

export interface TrendingContractV3 {
  rank: number;
  contractAddress: string;
  mentionCount: number;
  asset: {
    id: string;
    symbol: string;
    name: string;
    chains: string[];
  } | null;
}

export interface TrendingContractsV3Params {
  from: number;
  to?: number;
  minMentions?: number;
  limit?: number;
  cursor?: string;
}

export interface TrendingContractsV3Response extends ServedPageV3 {
  contracts: TrendingContractV3[];
}

export interface CallAssetV3 {
  id: string;
  symbol: string | null;
  name: string | null;
  entityType: EntityTypeV3;
}

export interface CallV3 {
  id: string;
  episodeId: string;
  handle: string | null;
  source: CallSourceKindV3 | null;
  channel: string | null;
  asset: CallAssetV3 | null;
  callAction: CallActionV3;
  setup: CallSetupV3 | null;
  thesis: CallThesisV3 | null;
  sourceRecordId: string;
  occurredAt: number;
}

export interface CallsV3Params {
  from?: number;
  to?: number;
  callIds?: string[];
  handle?: string;
  entityIds?: string[];
  order?: OrderV3;
  limit?: number;
  cursor?: string;
}

export interface CallsV3Response extends ServedPageV3 {
  calls: CallV3[];
}

export interface CallerTrackV3 {
  alphaScore: number | null;
  hitRate: number | null;
  avgReturn: number | null;
  scoredEpisodes: number;
  totalEpisodes: number;
}

export interface CallEpisodeV3 {
  id: string;
  handle: string | null;
  source: CallSourceKindV3 | null;
  channel: string | null;
  asset: CallAssetV3 | null;
  direction: CallDirectionV3;
  horizon: CallHorizonV3;
  status: CallStatusV3;
  openedAt: number;
  closedAt: number | null;
  observedAt: number;
  entryPrice: number | null;
  exitPrice: number | null;
  closeReason: CloseReasonV3 | null;
  setup: CallSetupV3 | null;
  thesis: CallThesisV3 | null;
  statedTarget: number | null;
  statedStop: number | null;
  track: CallerTrackV3 | null;
  calls: Array<{
    callId: string;
    callAction: CallActionV3;
    occurredAt: number;
  }>;
}

export interface CallEpisodesV3Params {
  from?: number;
  to?: number;
  episodeIds?: string[];
  handle?: string;
  entityIds?: string[];
  status?: CallStatusV3;
  direction?: CallDirectionV3;
  assetClass?: AssetClassV3;
  order?: OrderV3;
  limit?: number;
  cursor?: string;
}

export interface CallEpisodesV3Response extends ServedPageV3 {
  episodes: CallEpisodeV3[];
}

export interface PositioningV3Params {
  entityId: string;
}

export interface PositioningV3Response {
  id: string;
  symbol: string | null;
  name: string | null;
  openLong: number;
  openShort: number;
  asOf: number;
}

export interface TopAccountV3 {
  rank: number;
  handle: string;
  name: string | null;
  followerCount: number | null;
  verified: boolean;
  standing: number;
  track: CallerTrackV3 | null;
}

export interface TopAccountsV3Params {
  metric?: AccountMetricV3;
  order?: OrderV3;
  limit?: number;
  cursor?: string;
}

export interface TopAccountsV3Response extends PageV3 {
  accounts: TopAccountV3[];
}

export interface KeyStatusV3Response {
  plan: PlanV3;
  billingMode: BillingMode;
  owner: "user" | "org";
  scopes: string[];
  credits: {
    limit: number | null;
    used: number;
    remaining: number;
    resetsAt: number | null;
    requestsPerMinute: number;
  };
  historyFrom: number;
}

export type VerdictV3 = "supported" | "contradicted" | "notEnoughEvidence";

export interface VerifyYesNoRequestV3 {
  type: "yesNo";
  yes?: string;
  no?: string;
}

export interface VerifyChoiceOptionV3 {
  label: string;
  definition: string;
}

export interface VerifyChoiceRequestV3 {
  type: "choice";
  options: VerifyChoiceOptionV3[];
}

export interface VerifyScoreRequestV3 {
  type: "score";
  levels: string[];
}

export type VerifyDecisionRequestV3 =
  VerifyYesNoRequestV3 | VerifyChoiceRequestV3 | VerifyScoreRequestV3;

export interface VerifyV3Params {
  statement: string;
  asOf?: number;
  context?: string;
  decision?: VerifyDecisionRequestV3;
}

export interface VerifyYesNoDecisionV3 {
  type: "yesNo";
  yes: number;
}

export interface VerifyChoiceDecisionV3 {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
}

export interface VerifyScoreDecisionV3 {
  type: "score";
  score: number;
  levelProbabilities: number[];
}

export type VerifyDecisionV3 =
  VerifyYesNoDecisionV3 | VerifyChoiceDecisionV3 | VerifyScoreDecisionV3;

export interface VerifyEvidenceItemV3 {
  link: string;
  decisiveness: number;
  basis: boolean;
}

export type VerifyCoverageStatusV3 = "complete" | "partial" | "unavailable";

export interface VerifyV3Response {
  verdict: VerdictV3;
  probabilities: Record<VerdictV3, number>;
  decision: VerifyDecisionV3 | null;
  evidence: {
    twitter: VerifyEvidenceItemV3[];
    telegram: VerifyEvidenceItemV3[];
    web: VerifyEvidenceItemV3[];
  };
  asOf: number;
  searchedFrom: number;
  coverage: {
    complete: boolean;
    sources: {
      twitter: VerifyCoverageStatusV3;
      telegram: VerifyCoverageStatusV3;
      web: VerifyCoverageStatusV3;
    };
    captions: "complete" | "unavailable";
  };
}

export type MonitorStatusV3 = "active" | "ended";

export interface MonitorV3 {
  id: string;
  query: string;
  webhookUrl: string;
  webhookSecret: string;
  status: MonitorStatusV3;
  createdAt: number;
  updatedAt: number;
}

export interface MonitorsV3Response {
  data: MonitorV3[];
  total: number;
}

export interface CreateMonitorV3Params {
  query: string;
  webhookUrl: string;
}

export type UpdateMonitorV3Params =
  | { query: string; webhookUrl?: string }
  | { query?: string; webhookUrl: string };

export interface DeleteMonitorV3Response {
  id: string;
  deleted: true;
}

export interface MonitorCitedSourceV3 {
  source: string;
  sourceRecordId?: string | null;
  handle?: string | null;
  link?: string | null;
}

export interface MonitorEventItemV3 {
  source: "event";
  id: string;
  alertTitle?: string | null;
  summary?: string | null;
  analyzedAt?: number | null;
  firstSeenAt?: number | null;
  citedSources?: MonitorCitedSourceV3[] | null;
}

export interface MonitorWebItemV3 {
  source: "web";
  id: string;
  url?: string | null;
  title?: string | null;
  author?: string | null;
  excerpt?: string | null;
  publishedAt?: number | null;
  publishedDayOnly?: boolean | null;
  firstSeenAt?: number | null;
}

export interface MonitorMatchV3 {
  id: string;
  monitorId: string;
  matchedAt: number;
  items: Array<MonitorEventItemV3 | MonitorWebItemV3>;
}

export interface MonitorMatchesV3Params {
  limit?: number;
  cursor?: string;
}

export interface MonitorMatchesV3Response {
  data: MonitorMatchV3[];
  nextCursor: string | null;
}
