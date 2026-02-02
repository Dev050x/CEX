import { CREATE_ORDER } from "./index.js"

export type MessageToEngine = {
    type: typeof CREATE_ORDER,
    data: {
        market: string,
        price: string,
        quantity: string,
        side: "buy" | "sell",
        userId: string,
    }
} | {
    
}