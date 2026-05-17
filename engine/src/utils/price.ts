import type { OrderBook } from "../store/exchange-store";

export function get_ask_price(asset_orderbook: OrderBook): number {
    const bids = [...asset_orderbook.asks.keys()].sort((a,b) => b-a).slice(0,4);
    const average_price = bids.reduce((curr,acc) => curr+acc) / 4;
    return average_price;
}
