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
