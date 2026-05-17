export type Side = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "open" | "partially_filled" | "filled" | "cancelled";

export interface Balance {
  available: number;
  locked: number;
}

export interface RestingOrder {
  orderId: string;
  userId: string;
  side: Side;
  type: OrderType;
  symbol: string;
  price: number;
  qty: number;
  filledQty: number;
  status: OrderStatus;
  createdAt: number;
}

export interface OrderRecord {
  orderId: string;
  userId: string;
  side: Side;
  type: OrderType;
  symbol: string;
  price: number | null;
  qty: number;
  filledQty: number;
  status: OrderStatus;
  fills: Fill[];
  createdAt: number;
}

export interface Fill {
  fillId: string;
  symbol: string;
  price: number;
  qty: number;
  buyOrderId: string;
  sellOrderId: string;
  createdAt: number;
}

/*

{
  bids: {
    "100": RestingRecord,
    "100.1": RestingRecord
  },
  "asks": {
    "101": RestingRecord,
    "101.1": RestingRecord,
  }
}

*/

export interface OrderBook {
  bids: Map<number, RestingOrder[]>;
  asks: Map<number, RestingOrder[]>;
}



export interface CreateOrderInput {
  userId: string;
  type: OrderType;
  side: Side;
  symbol: string;
  price: number | null;
  qty: number;
}

export interface DepthLevel {
  price: number;
  qty: number;
}

export interface DepthResponse {
  symbol: string;
  bids: DepthLevel[];
  asks: DepthLevel[];
}


/*
    {
        "1": {
            "sol": {
                "available": 12,
                "locked": 15,
            },
            "eth": {
                "available": 1,
                "locked": 1,
            }
        },
    }
*/

export const BALANCES = new Map<string, Record<string, Balance>>();       //done
BALANCES.set("c1ed2d96-5fab-4510-94fc-8dd1d1148508", {
  "sol": {
    "available": 0,
    "locked": 0
  },
  "usd": {
    "available": 1000,
    "locked": 0,
  }
});
BALANCES.set("61cc60e3-74fa-4f8f-8ffc-542958fdb258", {
   "sol": {
    "available": 10,
    "locked": 0
  },
  "usd": {
    "available": 0,
    "locked": 0,
  }
})

/*
    {
      "sol": OrderBook,
      "eth": OrderBook
    }
*/

export const ORDERBOOKS = new Map<string, OrderBook>();                 //done
ORDERBOOKS.set("sol", {
  bids: new Map(),
  asks: new Map(),
});
/*
    {
      "1": OrderBook,
      "2": OrderBook
    }

*/

export const ORDERS = new Map<string, OrderRecord>();             //done

/*

*/

export const FILLS: Fill[] = [];                //done


export const user_counts: number = 0;
export let order_counts = 0;

export function get_order_count(): string {
  order_counts += 1;
  return order_counts.toString();
}