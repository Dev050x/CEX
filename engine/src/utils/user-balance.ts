import { BALANCES } from "../store/exchange-store";

 

export function update_users_available_balance(userId: string, asset: string, increase: boolean, qty: number) {
    const user_assets_balance = BALANCES.get(userId)![asset]!;
    if(increase) {
        user_assets_balance.available += qty;
        return;
    }
    user_assets_balance.available -= qty;
}

export function update_users_lock_balance(userId: string, asset: string, increase: boolean, qty: number) {
    const users_asset_balance = BALANCES.get(userId)![asset]!;
    if(increase) {
        users_asset_balance.locked += qty;
        return;
    }
    users_asset_balance.locked -= qty;
    console.log(`for userid ${userId}`, users_asset_balance ,asset);
}

export function user_have_enough_asset_balance(userId: string, asset: string, need: number): boolean {
    const user_balances = BALANCES.get(userId)!;
    const user_asset_balance = user_balances[asset]!;
    if(user_asset_balance.available >= need) {
        return true;
    }
    return false;
}

export function user_exists(userId: string):boolean {
    const user = BALANCES.get(userId);
    if(user) {
        return true;
    }
    return false;
}