import { BALANCES, FILLS, get_order_count, ORDERBOOKS, ORDERS } from "../store/exchange-store";
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
        const order_id = get_order_count();

        ORDERS.set(order_id, {
            orderId: order_id,
            userId: data.userId,
            side: data.side,
            type: "limit",
            symbol: data.symbol,
            price: data.price,
            qty: data.qty,
            filledQty: 0,
            status: "open",
            fills: [],
            createdAt: new Date().getTime(),
        });

        if (data.type === "limit") {
            if (!user_have_enough_asset_balance(data.userId, "usd", data.price! * data.qty)) {
                throw new Error("user don't have enough usd balance");
            }

            const remaining_qty = match_limit_order_into_orderbook(asset_orderbook, data, order_id);
            if (remaining_qty === 0) {
                return;
            }
            const status = data.qty === remaining_qty ? "open" : "partially_filled";
            const filled_qty = status === "partially_filled" ? data.qty - remaining_qty : 0;
            data.qty = remaining_qty;
            place_order_into_orderbook(asset_orderbook, data, status, filled_qty, order_id);
            console.log("orderbook looks like this..", ORDERBOOKS);
            console.log("BALANCES: ", BALANCES);
            console.log("FILLS: ", FILLS);

        }

        if (data.type === "market") {
            const avarage_ask_price = get_ask_price(asset_orderbook);
            if (!user_have_enough_asset_balance(data.userId, "usd", avarage_ask_price * data.qty)) {
                throw new Error("user don't have enough usd balance");
            }
            const remaining_qty = match_market_order_into_orderbook(asset_orderbook, data, order_id);
            if (remaining_qty === 0) {
                console.log("orderbook looks like this..", ORDERBOOKS);
                console.log("BALANCES: ", BALANCES);
                console.log("FILLS: ", FILLS);
                return;
            }
            const status = data.qty === remaining_qty ? "open" : "partially_filled";
            const filled_qty = status === "partially_filled" ? data.qty - remaining_qty : 0;
            data.qty = remaining_qty;
            place_order_into_orderbook(asset_orderbook, data, status, filled_qty, order_id);
            console.log("ORDERBOOKS", ORDERBOOKS);
            console.log("BALANCES: ", BALANCES);
            console.log("FILLS: ", FILLS);
        }
    }


    if (data.side === "sell") {
        const order_id = get_order_count();
        const asset_orderbook = ORDERBOOKS.get(data.symbol)!;
        if (data.type === "limit") {
            if (!user_have_enough_asset_balance(data.userId, data.symbol, data.qty)) {
                throw new Error("user don't have enough asset balance");
            }
            const remaining_qty = match_limit_order_into_orderbook(asset_orderbook, data, order_id);
            if (remaining_qty === 0) {
                return;
            }
            const status = data.qty === remaining_qty ? "open" : "partially_filled";
            const filled_qty = status === "partially_filled" ? data.qty - remaining_qty : 0;
            data.qty = remaining_qty;
            place_order_into_orderbook(asset_orderbook, data, status, filled_qty, order_id);
            console.log("orderbook looks like this..", ORDERBOOKS);
            console.log("BALANCES: ", BALANCES);
            console.log("FILLS: ", FILLS);
        }

        if (data.type === "market") {
            if (!user_have_enough_asset_balance(data.userId, data.symbol, data.qty)) {
                throw new Error("user don't have enough balance");
            }
            const remaining_qty = match_market_order_into_orderbook(asset_orderbook, data, order_id);
            if (remaining_qty === 0) {
                console.log("orderbook looks like this..", ORDERBOOKS);
                console.log("BALANCES: ", BALANCES);
                console.log("FILLS: ", FILLS);
                return;
            }
            const status = data.qty === remaining_qty ? "open" : "partially_filled";
            const filled_qty = status === "partially_filled" ? data.qty - remaining_qty : 0;
            data.qty = remaining_qty;
            place_order_into_orderbook(asset_orderbook, data, status, filled_qty, order_id);
            console.log("orderbook looks like this..", ORDERBOOKS);
            console.log("BALANCES: ", BALANCES);
            console.log("FILLS: ", FILLS);
        }
    }

}