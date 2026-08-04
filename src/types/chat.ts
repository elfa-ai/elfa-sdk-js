export type ChatAnalysisType =
  | "chat"
  | "macro"
  | "summary"
  | "tokenIntro"
  | "tokenAnalysis"
  | "accountAnalysis";

export type ChatSpeed = "fast" | "expert" | "adaptive";

export interface ChatAssetMetadata {
  symbol?: string;
  chain?: string;
  contractAddress?: string;
  username?: string;
}

export interface ChatParams {
  message?: string;
  sessionId?: string;
  analysisType?: ChatAnalysisType;
  speed?: ChatSpeed;
  assetMetadata?: ChatAssetMetadata;
}

export interface ChatStreamSessionInfoEvent {
  type: "session_info";
  sessionId: string;
  analysisType: ChatAnalysisType;
}

export interface ChatStreamTitleEvent {
  type: "title";
  title: string;
}

export interface ChatStreamTextEvent {
  type: "text";
  content: string;
}

export interface ChatStreamTextCompleteEvent {
  type: "text_complete";
}

export interface ChatStreamStatusEvent {
  type: "status";
  [key: string]: unknown;
}

export interface ChatStreamCreditsEvent {
  type: "credits";
  credits: number;
}

export interface ChatStreamCompleteEvent {
  type: "complete";
  success: boolean;
  sessionId: string;
  creditsConsumed: number;
}

export interface ChatStreamInvalidRequestEvent {
  type: "invalid_request";
  [key: string]: unknown;
}

export interface ChatStreamErrorEvent {
  type: "error";
  [key: string]: unknown;
}

export type ChatStreamEvent =
  | ChatStreamSessionInfoEvent
  | ChatStreamTitleEvent
  | ChatStreamTextEvent
  | ChatStreamTextCompleteEvent
  | ChatStreamStatusEvent
  | ChatStreamCreditsEvent
  | ChatStreamCompleteEvent
  | ChatStreamInvalidRequestEvent
  | ChatStreamErrorEvent;

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    sessionId: string;
    creditsConsumed: number;
  };
}
