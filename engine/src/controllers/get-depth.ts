import type { DepthLevel, DepthResponse, OrderBook } from "../store/exchange-store";

export function get_depth(asset_order_book: OrderBook, symbol: string):DepthResponse {
    const bids: DepthLevel[] = [];
    const bids_price = [...asset_order_book.bids.keys()].sort((a, b) => b - a);

    for (const price of bids_price) {
        const orders = asset_order_book.bids.get(price)!;
        const qty = orders.reduce((sum, order) => sum + order.qty, 0);
        bids.push({
            price,
            qty
        });
    };

    const asks: DepthLevel[] = [];
    const ask_prices = [...asset_order_book.asks.keys()].sort((a, b) => a - b);
    for(const price of ask_prices) {
        const orders = asset_order_book.asks.get(price)!;
        const qty = orders.reduce((sum, order) => sum + order.qty, 0);
        asks.push({
            price,
            qty
        });
    }

    return {
        symbol,
        bids,
        asks
    }
}