import { BALANCES, get_order_count, ORDERBOOKS } from "../store/exchange-store";
import type { EngineRequest } from "../types/engine";
import { match_limit_order_into_orderbook, match_market_order_into_orderbook, place_order_into_orderbook } from "../utils/orderbook";
import { get_ask_price } from "../utils/price";
import { user_exists, user_have_enough_asset_balance } from "../utils/user-balance";

//we just need to create a new order here that's it
export async function create_order(message: EngineRequest): Promise<void> {
    const data = message.payload;
    console.log("this is incoming data...", data);

    if (!user_exists(data.userId)) {
        throw new Error("user does not exists");
    }

    if (data.side === "buy") {
        const asset_orderbook = ORDERBOOKS.get(data.symbol)!;
        if (data.type === "limit") {
            if (!user_have_enough_asset_balance(data.userId, "usd", data.price! * data.qty)) {
                throw new Error("user don't have enough usd balance");
            }
            const remaining_qty = match_limit_order_into_orderbook(asset_orderbook, data);
            if (remaining_qty === 0) {
                return;
            }
            data.qty = remaining_qty;
            console.log("data qty is ........", data.qty);
            place_order_into_orderbook(asset_orderbook, data);
        }

        if (data.type === "market") {
            const avarage_ask_price = get_ask_price(asset_orderbook);
            if (!user_have_enough_asset_balance(data.userId, "usd", avarage_ask_price * data.qty)) {
                throw new Error("user don't have enough usd balance");
            }
            const remaining_qty = match_market_order_into_orderbook(asset_orderbook, data);
            if (remaining_qty === 0) {
                return;
            }
            data.qty = remaining_qty;
            place_order_into_orderbook(asset_orderbook, data);
        }
    }


    if (data.side === "sell") {
        const asset_orderbook = ORDERBOOKS.get(data.symbol)!;
        if (data.type === "limit") {
            if (!user_have_enough_asset_balance(data.userId, data.symbol, data.qty)) {
                throw new Error("user don't have enough asset balance");
            }
            const remaining_qty = match_limit_order_into_orderbook(asset_orderbook, data);
            if (remaining_qty === 0) {
                return;
            }
            data.qty = remaining_qty;
            place_order_into_orderbook(asset_orderbook, data);
        }

        if (data.type === "market") {
            if (!user_have_enough_asset_balance(data.userId, data.symbol, data.qty)) {
                throw new Error("user don't have enough balance");
            }
            const remaining_qty = match_market_order_into_orderbook(asset_orderbook, data);
            console.log("remaining qty.....", remaining_qty);
            if (remaining_qty === 0) {
                return;
            }
            data.qty = remaining_qty;
            place_order_into_orderbook(asset_orderbook, data);

        }
    }

}