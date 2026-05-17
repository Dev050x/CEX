import { updateSourceFile } from "typescript";
import { BALANCES, get_order_count, ORDERBOOKS, type CreateOrderInput, type OrderBook, type RestingOrder } from "../store/exchange-store";
import { update_users_available_balance, update_users_lock_balance } from "./user-balance";


//place order into orderbook
export function place_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput) {
    if (data.side === "buy") {
        console.log("buying order...", data.qty);
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

        update_users_lock_balance(data.userId, "usd", true, data.price! * data.qty);
        update_users_available_balance(data.userId, "usd", false, data.price! * data.qty);
        console.log("orderbook looks like this..", ORDERBOOKS);
        console.log("user's balance looks like this after placing the order...", BALANCES.get(data.userId))

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
        update_users_lock_balance(data.userId, data.symbol, true, data.qty);
        update_users_available_balance(data.userId, data.symbol, false, data.qty);
        console.log("orderbook looks like this..", ORDERBOOKS);
        console.log("user's balance looks like this after placing the order...", BALANCES.get(data.userId))
    }
}

//match order into orderbook
export function match_limit_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput): number {
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

export function match_market_order_into_orderbook(asset_orderbook: OrderBook, data: CreateOrderInput): number {
    let qty = data.qty;
    if (data.side === "buy") {
        const asks = asset_orderbook.asks;

        for (const price of [...asks.keys()].sort((a, b) => a - b)) {
            if (qty === 0) {
                break;
            }
            for (const resting_record of asks.get(price)!) {
                if (qty === 0) {
                    break;
                }
                let i: number = 0;
                if (resting_record.qty > qty) {  //partially fill orderbook order
                    //update record
                    resting_record.qty -= qty;
                    qty = 0;
                    //increase user a's asset balance(available)
                    //decrease user a's usd balance(available)  
                    update_users_available_balance(data.userId, data.symbol, true, data.qty);
                    update_users_available_balance(data.userId, "usd", false, data.qty * resting_record.price);

                    //decrease user b's asset balance(locked)
                    //increse user b's usd balance(availble)
                    update_users_lock_balance(resting_record.userId, resting_record.symbol, false, resting_record.qty);
                    update_users_available_balance(resting_record.userId, "usd", true, resting_record.qty * resting_record.price);
                } else {         //completely fill orderbook order and remove it
                    //take out this resting order from the map
                    const resting_records_for_this_price = asks.get(price)!;
                    resting_records_for_this_price.splice(i, 1);
                    qty -= resting_record.qty;

                    //increase user a's asset balance(available)
                    //decrease user a's usd balance(available)  
                    update_users_available_balance(data.userId, data.symbol, true, data.qty);
                    update_users_available_balance(data.userId, "usd", false, data.qty * resting_record.price);

                    //decrease user b's asset balance(locked)
                    //increse user b's usd balance(availble)
                    update_users_lock_balance(resting_record.userId, resting_record.symbol, false, resting_record.qty);
                    update_users_available_balance(resting_record.userId, "usd", true, resting_record.qty * resting_record.price);

                }
                i++;
            }
        }

    } else {
        const bids = asset_orderbook.bids;
        console.log("................");
        for (const price of [...bids.keys()].sort((a, b) => b - a)) {
            console.log("hello from the outer loop");
            console.log("price....", price);
            if (qty === 0) {
                break;
            }

            for (const order of bids.get(price)!) {
                console.log("hello from the loop");
                if (qty === 0) {
                    break;
                }
                let i: number = 0;
                if (order.qty > qty) {  //can fill completely-> need to update orderbook
                    order.qty -= qty;
                    qty = 0;

                    //update person a's balance(sellers)
                    update_users_available_balance(data.userId, data.symbol, false, order.qty);
                    update_users_available_balance(data.userId, "usd", true, order.qty * price);

                    //updaet person b's balance(buyers)
                    update_users_lock_balance(order.userId, "usd", false, order.qty);
                    update_users_available_balance(order.userId, order.symbol, true, order.qty * price);
                    console.log(`user's a balance after limit buy order get matched ${data.userId} `, BALANCES.get(data.userId!));
                    console.log(`user's b balance after limit buy order get matched ${order.userId} `, BALANCES.get(data.userId!));
                    break;
                }

                qty -= order.qty;
                //takeout entire resting order from the map
                const RestingOrders = bids.get(price)!
                RestingOrders.splice(i, 1);

                //update person a's balance(sellers)
                update_users_available_balance(data.userId, data.symbol, false, order.qty);
                update_users_available_balance(data.userId, "usd", true, order.qty * price);

                //updaet person b's balance(buyers)
                update_users_lock_balance(order.userId, "usd", false, order.qty*order.price!);
                console.log("after decreasing the lock...", order.userId, BALANCES.get(order.userId) );
                update_users_available_balance(order.userId, order.symbol, true, order.qty);
                console.log("after increasing the asset balance", order.userId, BALANCES.get(order.userId) );
                console.log(`user's a balance after limit buy order get matched ${data.userId} `, BALANCES.get(data.userId!));
                console.log(`user's b balance after limit buy order get matched ${order.userId} `, BALANCES.get(order.userId!));
                i++;
            }
            console.log("cl")
        }
    }
    console.log("the qty is.................. for this asset ", qty, asset_orderbook);
    return qty;

}
