import { BALANCES, get_order_count, ORDERBOOKS } from "../store/exchange-store";
import type { EngineRequest } from "../types/engine";
import { place_order_into_orderbook } from "../utils/orderbook";
import {  lock_unlock_user_balance, user_exists, user_have_enough_asset_balance } from "../utils/user-balance";

//we just need to create a new order here that's it
export async function create_order(message: EngineRequest): Promise<void> {
    const data = message.payload;
    console.log("this is incoming data...", data);

    if(!user_exists(data.userId)) {
        throw new Error("user does not exists");
    }

    if(data.side === "buy") {
        if(data.type === "limit") {
            if(!user_have_enough_asset_balance(data.userId, "usd", data.price! * data.qty)){
                throw new Error("user don't have enough usd balance");
            }
            const asset_orderbook = ORDERBOOKS.get(data.symbol)!;
            place_order_into_orderbook(asset_orderbook, data);
        }

        if(data.type === "market"){

        }
    }


    if(data.side === "sell") {         
        if(data.type === "limit"){
            if(!user_have_enough_asset_balance(data.userId, data.symbol, data.qty)) {
                throw new Error("user don't have enough asset balance");
            }
            const asset_orderbook = ORDERBOOKS.get(data.symbol)!;
            place_order_into_orderbook(asset_orderbook, data);
        }   

        if(data.type === "market") {

        }
    }   

}