import type { OrderType, Side } from "../store/exchange-store";

export type EngineCommandType =
  | "create_order"
  | "get_depth"
  | "get_user_balance"
  | "get_order"
  | "cancel_order";

export interface CreateOrderInput {
  userId: string;
  type: OrderType;
  side: Side;
  symbol: string;
  price: number | null;
  qty: number;
}

export interface GetDepthInput {
  symbol: string
}

export interface GetUserBalance{
  userId: string;
}

export interface GetOrderInput{
  userId: string,
  orderId: string;
}

export interface EngineRequest {
  correlationId: string;
  responseQueue: string;
  type: EngineCommandType;
  payload: CreateOrderInput | GetDepthInput | GetOrderInput;
}

export interface EngineResponse {
  correlationId: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface Balance{
  available: number,
  locked: number
};

// :-)) I added this just to check the flow, remove it when you start
const DUMMY_SELL_ORDER = {
  orderId: "dummy-sell-order-1",
  userId: "dummy-seller",
  type: "limit",
  side: "sell",
  symbol: "BTC",
  price: 100,
  qty: 1,
  filledQty: 0,
  status: "open",
};
