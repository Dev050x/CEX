import "dotenv/config";
import { createClient } from "redis";
import { env } from "./utils/env.js";
import type { CreateOrderInput, EngineRequest, EngineResponse, GetDepthInput, GetOrderInput, GetUserBalance } from "./types/engine.js";
import { create_order } from "./controllers/create-order.js";
import { get_depth } from "./controllers/get-depth.js";
import { ORDERBOOKS, ORDERS } from "./store/exchange-store.js";
import { user_balance } from "./utils/user-balance.js";

const brokerClient = createClient({ url: env.redisUrl }).on("error", (error) => {
  console.error("Redis broker client error", error);
});

const responseClient = createClient({ url: env.redisUrl }).on("error", (error) => {
  console.error("Redis response client error", error);
});

await Promise.all([brokerClient.connect(), responseClient.connect()]);


async function sendResponse(responseQueue: string, response: EngineResponse): Promise<void> {
  await responseClient.lPush(responseQueue, JSON.stringify(response));
}

async function handleEngineRequest(message: EngineRequest): Promise<any> {
  if (message.type === "create_order") {

    const payload = message.payload as CreateOrderInput;
    const order_record = create_order(payload);
    const fills_qty = order_record.fills.reduce((sum, fill) => fill.qty + sum , 0);
    const average_price = order_record.fills.reduce((sum, fill) => fill.price * fill.qty + sum, 0) / fills_qty;
    console.log("order record: ", order_record);
    return {
      "status": order_record.status,
      "filledQty": order_record.filledQty,
      "averagePrice": average_price,
      "fills": order_record.fills,
    }

  } else if (message.type === "get_depth") {

    const payload = message.payload as GetDepthInput;
    return get_depth(ORDERBOOKS.get(payload.symbol)!, payload.symbol);

  } else if (message.type === "cancel_order") {

  } else if (message.type === "get_order") {

    const payload = message.payload as GetOrderInput;
    const order = ORDERS.get(payload.orderId);
    return order;

  } else if (message.type === "get_user_balance") {
    const payload = message.payload as GetUserBalance;
    return user_balance(payload.userId);
  }
}

console.log(`Engine listening on Redis queue: ${env.incomingQueue}`);

for (; ;) {
  const item = await brokerClient.brPop(env.incomingQueue, 0);
  if (!item) continue;

  let message: EngineRequest;

  try {
    message = JSON.parse(item.element) as EngineRequest;       // actual order
  } catch {
    console.error("Skipping invalid broker message");
    continue;
  }

  try {
    const data = await handleEngineRequest(message);
    await sendResponse(message.responseQueue, {
      correlationId: message.correlationId,
      ok: true,
      data,
    });
  } catch (error) {
    await sendResponse(message.responseQueue, {
      correlationId: message.correlationId,
      ok: false,
      error: error instanceof Error ? error.message : "engine_error",
    });
  }
}