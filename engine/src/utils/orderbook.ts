import { updateSourceFile } from "typescript";
import { BALANCES, FILLS, get_fills_count, get_order_count, ORDERBOOKS, ORDERS, type OrderBook, type OrderStatus, type RestingOrder } from "../store/exchange-store";
import { update_users_available_balance, update_users_lock_balance } from "./user-balance";
import type { CreateOrderInput } from "../types/engine";


//place order into orderbook
export function place_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput, status: OrderStatus, filled_qty: number, order_id: string) {
    if (data.side === "buy") {
        asset_orderbook.bids.set(data.price!, [...(asset_orderbook.bids.get(data.price!) ?? []),
        {
            orderId: order_id,
            userId: data.userId,
            side: data.side,
            type: "limit",
            symbol: data.symbol,
            price: data.price!,
            qty: data.qty,
            filledQty: filled_qty,
            status: status,
            createdAt: new Date().getTime(),
        }
        ]);
        update_users_lock_balance(data.userId, "usd", true, data.price! * data.qty);
        update_users_available_balance(data.userId, "usd", false, data.price! * data.qty);

    } else {
        asset_orderbook.asks.set(data.price!, [...(asset_orderbook.asks.get(data.price!) ?? []), {
            orderId: order_id,
            userId: data.userId,
            side: data.side,
            type: data.type,
            symbol: data.symbol,
            price: data.price!,
            qty: data.qty,
            filledQty: filled_qty,
            status: status,
            createdAt: new Date().getTime(),
        }
        ]);
        update_users_lock_balance(data.userId, data.symbol, true, data.qty);
        update_users_available_balance(data.userId, data.symbol, false, data.qty);
    }
}

//match order into orderbook
export function match_limit_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput, order_id: string): number {
    if (data.side === "buy") {
        let qty = data.qty;
        const bid_price = data.price!;
        // const available_matches:[number, RestingOrder][] = [];
        for (const price of [...asset_orderbook.asks.keys()].sort((a, b) => a - b)) {
            if (qty === 0) {
                break;
            }
            if (price <= bid_price) {
                for (const order of asset_orderbook.asks.get(price)!) {
                    let i: number = 0;
                    if (qty !== 0) {
                        //update person a's balance
                        update_users_available_balance(data.userId, data.symbol, true, order.qty);
                        update_users_available_balance(data.userId, "usd", false, order.qty * price);

                        //updaet person b's balance
                        update_users_lock_balance(order.userId, order.symbol, false, order.qty);
                        update_users_available_balance(order.userId, "usd", true, order.qty * price);

                        if (order.qty > qty) {

                            const fill = {
                                fillId: get_fills_count(),
                                symbol: order.symbol,
                                price: price,
                                qty: qty,
                                buyOrderId: order_id,
                                sellOrderId: order.orderId,
                                createdAt: new Date().getTime()
                            };
                            FILLS.push(fill);

                            const order_record_a = ORDERS.get(order_id)!; //for user'a
                            order_record_a.filledQty += qty;
                            order_record_a.fills.push(fill);
                            order_record_a.status = "filled";


                            const order_record_b = ORDERS.get(order.orderId)!;
                            order_record_b.filledQty += qty;
                            order_record_b.fills.push(fill);
                            const status = order.qty === qty ? "filled" : "partially_filled";
                            order_record_b.status = status;

                            order.filledQty = qty;
                            order.qty -= qty;
                            order.status = "partially_filled";
                            qty = 0;
                            break;

                        } else {
                            const fill = {
                                fillId: get_fills_count(),
                                symbol: order.symbol,
                                price: price,
                                qty: qty,
                                buyOrderId: order_id,
                                sellOrderId: order.orderId,
                                createdAt: new Date().getTime()
                            };
                            FILLS.push(fill);

                            const order_record_a = ORDERS.get(order_id)!; //for users'a
                            order_record_a.filledQty += order.qty;
                            const status = order.qty === data.qty ? "filled" : "partially_filled";
                            order_record_a.status = status;
                            order_record_a.fills.push(fill);

                            const order_record_b = ORDERS.get(order.orderId)!;
                            order_record_b.filledQty += qty;
                            order_record_b.fills.push(fill);
                            order_record_b.status = "filled";
                            order_record_b.fills.push(fill);

                            asset_orderbook.asks.get(price)!.splice(i, 1);
                            qty -= order.qty;
                        }

                    } else {
                        break;
                    }
                    i++;
                }
            }

            if (asset_orderbook.asks.get(price)?.length === 0) {
                asset_orderbook.asks.delete(price);
            }
        };

        return qty;
    }
    else {
        let qty = data.qty;
        const ask_price = data.price!;
        for (const price of [...asset_orderbook.bids.keys()].sort((a, b) => b - a)) {
            if (qty === 0) {
                break;
            }
            if (price >= ask_price) {
                for (const order of asset_orderbook.bids.get(price)!) {
                    let i: number = 0;
                    if (qty !== 0) {
                        update_users_available_balance(data.userId, data.symbol, false, order.qty);
                        update_users_available_balance(data.userId, "usd", true, order.qty * price);

                        update_users_lock_balance(order.userId, order.symbol, false, order.qty);
                        update_users_available_balance(order.userId, "usd", false, order.qty * price);
                        if (order.qty > qty) {
                            const fill = {
                                fillId: get_fills_count(),
                                symbol: order.symbol,
                                price: price,
                                qty: qty,
                                buyOrderId: order.orderId,
                                sellOrderId: order_id,
                                createdAt: new Date().getTime()
                            };
                            FILLS.push(fill);

                            const order_record_a = ORDERS.get(order_id)!;
                            order_record_a.filledQty += qty;
                            order_record_a.status = "filled";
                            order_record_a.fills.push(fill);

                            const order_record_b = ORDERS.get(order.orderId)!;
                            order_record_b.filledQty += qty;
                            order_record_b.fills.push(fill);
                            const status = order.qty === qty ? "filled" : "partially_filled";
                            order_record_b.status = status;

                            order.qty -= qty;
                            order.filledQty = qty;
                            order.status = "partially_filled";
                            qty = 0;
                            break;

                        }
                        else {
                            const fill = {
                                fillId: get_fills_count(),
                                symbol: order.symbol,
                                price: price,
                                qty: qty,
                                buyOrderId: order.orderId,
                                sellOrderId: order_id,
                                createdAt: new Date().getTime()
                            };
                            FILLS.push(fill);

                            const order_record_a = ORDERS.get(order_id)!; //for users'a
                            order_record_a.filledQty += order.qty;
                            const status = order.qty === data.qty ? "filled" : "partially_filled";
                            order_record_a.status = status;

                            const order_record_b = ORDERS.get(order.orderId)!;
                            order_record_b.filledQty += qty;
                            order_record_b.fills.push(fill);
                            order_record_b.status = "filled";

                            asset_orderbook.bids.get(price)!.splice(i,1);
                            qty -= order.qty;

                        }

                    } else {
                        break;
                    }
                    i++;
                }
            }

            if (asset_orderbook.bids.get(price)?.length === 0) {
                asset_orderbook.bids.delete(price);
            }
        }
        return qty;
    }
}

export function match_market_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput, order_id: string): number {
    let qty = data.qty;
    if (data.side === "buy") {
        const asks = asset_orderbook.asks;
        for (const price of [...asks.keys()].sort((a, b) => a - b)) {
            if (qty === 0) {
                break;
            }
            for (const order of asks.get(price)!) {
                if (qty === 0) {
                    break;
                }
                let i: number = 0;

                update_users_available_balance(data.userId, data.symbol, true, data.qty);
                update_users_available_balance(data.userId, "usd", false, data.qty * order.price);
                update_users_lock_balance(order.userId, order.symbol, false, order.qty);
                update_users_available_balance(order.userId, "usd", true, order.qty * order.price);

                if (order.qty > qty) {
                    const fill = {
                        fillId: get_fills_count(),
                        symbol: order.symbol,
                        price: price,
                        qty: qty,
                        buyOrderId: order_id,
                        sellOrderId: order.orderId,
                        createdAt: new Date().getTime(),
                    };
                    FILLS.push(fill);
                    const order_record_a = ORDERS.get(order_id)!; //for user'a
                    order_record_a.filledQty += qty;
                    order_record_a.fills.push(fill);
                    order_record_a.status = "filled";


                    const order_record_b = ORDERS.get(order.orderId)!;
                    order_record_b.filledQty += qty;
                    order_record_b.fills.push(fill);
                    const status = order.qty === qty ? "filled" : "partially_filled";
                    order_record_b.status = status;


                    order.qty -= qty;
                    order.filledQty = qty;
                    order.status = "partially_filled";
                    qty = 0;



                } else {
                    const fill = {
                        fillId: get_fills_count(),
                        symbol: order.symbol,
                        price: price,
                        qty: qty,
                        buyOrderId: order_id,
                        sellOrderId: order.orderId,
                        createdAt: new Date().getTime(),
                    };
                    FILLS.push(fill);

                    const order_record_a = ORDERS.get(order_id)!; //for users'a
                    order_record_a.filledQty += order.qty;
                    const status = order.qty === data.qty ? "filled" : "partially_filled";
                    order_record_a.status = status;

                    const order_record_b = ORDERS.get(order.orderId)!;
                    order_record_b.filledQty += qty;
                    order_record_b.fills.push(fill);
                    order_record_b.status = "filled";

                    const resting_records_for_this_price = asks.get(price)!;
                    resting_records_for_this_price.splice(i, 1);
                    qty -= order.qty;

                }
                i++;
            }
            if (asset_orderbook.asks.get(price)?.length === 0) {
                asset_orderbook.asks.delete(price);
            }
        }

    } else {
        const bids = asset_orderbook.bids;

        for (const price of [...bids.keys()].sort((a, b) => b - a)) {
            if (qty === 0) {
                break;
            }

            for (const order of bids.get(price)!) {
                if (qty === 0) {
                    break;
                }
                let i: number = 0;
                //update person a's balance(sellers)
                update_users_available_balance(data.userId, data.symbol, false, order.qty);
                update_users_available_balance(data.userId, "usd", true, order.qty * price);

                //updaet person b's balance(buyers)
                update_users_lock_balance(order.userId, "usd", false, order.qty * price);
                update_users_available_balance(order.userId, order.symbol, true, order.qty);

                if (order.qty > qty) {
                    const fill = {
                        fillId: get_fills_count(),
                        symbol: order.symbol,
                        price: price,
                        qty: qty,
                        buyOrderId: order.orderId,
                        sellOrderId: order_id,
                        createdAt: new Date().getTime(),
                    };
                    FILLS.push(fill);

                    const order_record_a = ORDERS.get(order_id)!;
                    order_record_a.filledQty += qty;
                    order_record_a.status = "filled";
                    order_record_a.fills.push(fill);

                    const order_record_b = ORDERS.get(order.orderId)!;
                    order_record_b.filledQty += qty;
                    order_record_b.fills.push(fill);
                    const status = order.qty === qty ? "filled" : "partially_filled";
                    order_record_b.status = status;

                    order.qty -= qty;
                    order.filledQty = qty;
                    order.status = "partially_filled";
                    qty = 0;
                    break;

                } else {
                    const fill = {
                        fillId: get_fills_count(),
                        symbol: order.symbol,
                        price: price,
                        qty: qty,
                        buyOrderId: order.orderId,
                        sellOrderId: order_id,
                        createdAt: new Date().getTime(),
                    };
                    FILLS.push(fill);

                    const order_record_a = ORDERS.get(order_id)!; //for users'a
                    order_record_a.filledQty += order.qty;
                    const status = order.qty === data.qty ? "filled" : "partially_filled";
                    order_record_a.status = status;
                    order_record_a.fills.push(fill);

                    const order_record_b = ORDERS.get(order.orderId)!;
                    order_record_b.filledQty += qty;
                    order_record_b.fills.push(fill);
                    order_record_b.status = "filled";
                    order_record_b.fills.push(fill);

                    qty -= order.qty;
                    const RestingOrders = bids.get(price)!
                    RestingOrders.splice(i, 1);

                }
                i++;
            }

            if (asset_orderbook.bids.get(price)?.length === 0) {
                asset_orderbook.bids.delete(price);
            }

        }
    }
    return qty;

}
