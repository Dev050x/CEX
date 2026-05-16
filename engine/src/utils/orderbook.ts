import { get_order_count, type CreateOrderInput, type OrderBook } from "../store/exchange-store";

export function place_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput) {

    if (data.side === "buy") {
        asset_orderbook.bids.set(data.price!, [...(asset_orderbook.bids.get(data.price!) ?? []),
        {
            orderId: get_order_count(),
            userId: data.userId,
            side: data.side,
            type: "limit",
            symbol: data.symbol,
            price: data.price!,
            qty: data.qty,
            filledQty: 0,
            status: "open",
            createdAt: new Date().getTime(),
        }
        ]);
    } else {
        asset_orderbook.asks.set(data.price!, [...(asset_orderbook.asks.get(data.price!) ?? []), {
            orderId: get_order_count(),
            userId: data.userId,
            side: data.side,
            type: data.type,
            symbol: data.symbol,
            price: data.price!,
            qty: data.qty,
            filledQty: 0,
            status: "open",
            createdAt: new Date().getTime(),
        }
    ]);
    }
}

export function match_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput) {
    if(data.side === "buy") {

    }else {
        
    }
}

