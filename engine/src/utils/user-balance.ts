import { BALANCES } from "../store/exchange-store";

export function update_user_balance(userId: string, asset: string, needTolock: boolean, qty: number) {
    const user_balances = BALANCES.get(userId)!;
    const user_asset_balance = user_balances[asset]!;
    if(needTolock) {
        user_asset_balance.available -= qty;
        user_asset_balance.locked += qty;
        return;
    }
    user_asset_balance.available += qty;
    user_asset_balance.locked -= qty;
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