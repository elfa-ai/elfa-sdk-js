export type TradeExchange = "hyperliquid" | "gmx";

export type TradeOrderType = "market" | "limit";

export type TradeSide = "buy" | "sell";

export interface TradeErrorDetail {
  code: string;
  message: string;
}

export interface TradeResultResponse {
  success: boolean;
  orderId?: string;
  filledSize?: string;
  avgFillPrice?: string;
  error?: TradeErrorDetail;
}

export interface TradePreviewResponse {
  success: boolean;
  wouldExecute: boolean;
  error?: TradeErrorDetail;
}

export interface PlaceOrderInput {
  exchange: TradeExchange;
  symbol: string;
  side: TradeSide;
  orderType: TradeOrderType;
  size?: string;
  amount?: string;
  positionSizePercent?: number;
  price?: string;
  leverage?: number;
  marginType?: "cross" | "isolated";
  tp?: string;
  sl?: string;
  reduceOnly?: boolean;
}

export interface CancelOrderInput {
  exchange: TradeExchange;
  symbol: string;
  orderId: string;
}

export interface ModifyOrderInput {
  exchange: TradeExchange;
  symbol: string;
  orderId: string;
  size?: string;
  price?: string;
  triggerPrice?: string;
}

export interface ClosePositionInput {
  exchange: TradeExchange;
  symbol: string;
  orderType: TradeOrderType;
  size?: string;
  amount?: string;
  closePercent?: number;
  price?: string;
}

export interface SetPositionTpslInput {
  exchange: TradeExchange;
  symbol: string;
  tp?: string;
  sl?: string;
  size?: string;
}
