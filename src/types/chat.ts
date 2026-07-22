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

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    sessionId: string;
    creditsConsumed: number;
  };
}
