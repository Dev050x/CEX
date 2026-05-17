import { updateSourceFile } from "typescript";
import { BALANCES, get_order_count, ORDERBOOKS, type CreateOrderInput, type OrderBook, type RestingOrder } from "../store/exchange-store";
import { lock_unlock_user_balance, update_users_available_balance, update_users_lock_balance } from "./user-balance";

export function place_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput) {
    const remaining_qty = match_order_into_orderbook(asset_orderbook, data);
    if (remaining_qty === 0) {
        console.log("orderbook looks like this..", ORDERBOOKS);
        return;
    }
    if (data.side === "buy") {
        asset_orderbook.bids.set(data.price!, [...(asset_orderbook.bids.get(data.price!) ?? []),
        {
            orderId: get_order_count(),
            userId: data.userId,
            side: data.side,
            type: "limit",
            symbol: data.symbol,
            price: data.price!,
            qty: remaining_qty,
            filledQty: 0,
            status: "open",
            createdAt: new Date().getTime(),
        }
        ]);

        lock_unlock_user_balance(data.userId, "usd", true, data.price! * data.qty);
        console.log("orderbook looks like this..", ORDERBOOKS);

    } else {
        asset_orderbook.asks.set(data.price!, [...(asset_orderbook.asks.get(data.price!) ?? []), {
            orderId: get_order_count(),
            userId: data.userId,
            side: data.side,
            type: data.type,
            symbol: data.symbol,
            price: data.price!,
            qty: remaining_qty,
            filledQty: 0,
            status: "open",
            createdAt: new Date().getTime(),
        }
        ]);
        lock_unlock_user_balance(data.userId, data.symbol, true, data.qty);
        console.log("orderbook looks like this..", ORDERBOOKS);
    }
}

export function match_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput): number {
    if (data.side === "buy") {
        let qty = data.qty;
        const bid_price = data.price!;
        // const available_matches:[number, RestingOrder][] = [];

        for (const [price, RestingOrders] of asset_orderbook.asks) {
            if (qty === 0) {
                break;
            }
            if (price <= bid_price) {
                for (const order of RestingOrders) {
                    let i: number = 0;
                    if (qty !== 0) {
                        //if order quantity can fill our entire position then it's okay
                        if (order.qty > qty) {
                            order.qty -= qty;
                            qty = 0;

                            //update person a's balance
                            update_users_available_balance(data.userId, data.symbol, true, order.qty);
                            update_users_available_balance(data.userId, "usd", false, order.qty * price);

                            //updaet person b's balance
                            update_users_lock_balance(order.userId, order.symbol, false, order.qty);
                            update_users_available_balance(order.userId, "usd", true, order.qty * price);
                            console.log(`user's a balance after limit buy order get matched ${data.userId} `, BALANCES.get(data.userId!));
                            console.log(`user's b balance after limit buy order get matched ${order.userId} `, BALANCES.get(data.userId!));
                            break;
                        }

                        //takeout entire resting order from the map
                        RestingOrders.splice(i, 1);
                        //update person a's balance
                        update_users_available_balance(data.userId, data.symbol, true, order.qty);
                        update_users_available_balance(data.userId, "usd", false, order.qty * price);

                        //updaet person b's balance
                        update_users_lock_balance(order.userId, order.symbol, false, order.qty);
                        update_users_available_balance(order.userId, "usd", true, order.qty * price);
                        console.log(`user's a balance after limit buy order get matched ${data.userId} `, BALANCES.get(data.userId!));
                        console.log(`user's b balance after limit buy order get matched ${order.userId} `, BALANCES.get(data.userId!));
                        qty -= order.qty;
                    } else {
                        break;
                    }
                    i++;
                }
            }
        };
        return qty;

    }
    else {
        let qty = data.qty;     //sol selling
        const ask_price = data.price!;


        for (const [price, RestingOrders] of asset_orderbook.bids) {
            if (qty === 0) {
                break;
            }
            if (price >= ask_price) {
                for (const order of RestingOrders) {
                    let i: number = 0;
                    if (qty !== 0) {
                        //if order quantity can fill our entire position then it's okay
                        if (order.qty > qty) {
                            order.qty -= qty;
                            qty = 0;
                            console.log("i reached here ................................................");
                            //update person a's balance(sellers)
                            update_users_available_balance(data.userId, data.symbol, false, order.qty);
                            update_users_available_balance(data.userId, "usd", true, order.qty * price);

                            //updaet person b's balance(buyers)
                            update_users_lock_balance(order.userId, order.symbol, false, order.qty);
                            update_users_available_balance(order.userId, "usd", false, order.qty * price);
                            console.log(`user's a balance after limit buy order get matched ${data.userId} `, BALANCES.get(data.userId!));
                            console.log(`user's b balance after limit buy order get matched ${order.userId} `, BALANCES.get(data.userId!));
                            break;
                        }

                        //takeout entire resting order from the map
                        RestingOrders.splice(i, 1);
                        //update person a's balance(sellers)
                        update_users_available_balance(data.userId, data.symbol, false, order.qty);
                        update_users_available_balance(data.userId, "usd", true, order.qty * price);

                        //updaet person b's balance(buyers)
                        update_users_lock_balance(order.userId, order.symbol, false, order.qty);
                        update_users_available_balance(order.userId, "usd", false, order.qty * price);
                        console.log(`user's a balance after limit buy order get matched ${data.userId} `, BALANCES.get(data.userId!));
                        console.log(`user's b balance after limit buy order get matched ${order.userId} `, BALANCES.get(data.userId!));
                        qty -= order.qty;
                    } else {
                        break;
                    }
                    i++;
                }
            }
        }
        return qty;
    }
}

