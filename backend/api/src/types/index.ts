export const CREATE_ORDER = "CREATE_ORDER";

export type MessageFromOrderBook = {
    type: "ORDER_PLACED",
    payload: {
        orderId: string,
        executedQty: number,
        fills: [{
            price: string,
            qty: number,
            tradeId: number
        }]
    }
}