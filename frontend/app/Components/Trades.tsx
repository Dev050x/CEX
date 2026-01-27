"use client"
import { useEffect, useState } from "react"
import { getTrades } from "../utils/httpClient"
import { Trade } from "../utils/types";

const Trades = ({ market }: { market: string }) => {
    const [trades, setTrades] = useState<Trade[] | null>(null);
    useEffect(() => {
        const trades = async () => {
            const trades = await getTrades(market, "17");
            console.log("trades: ", trades);
            setTrades(trade => trades);
            return trades;
        }
        trades();
    }, [market]);

    return (
        <div className="flex flex-col ">
            <div className="h-[42px] py-3 pl-6 text-[#EAECEF] font-bold">
                Market Trades
            </div>
            <hr className="text-[#424755]" />
            <TableHeader />
            <>
                {
                    trades && trades.map((trade, index) =>
                        <Bid price={trade.price} size={trade.quantity} time={trade.timestamp.toString()} color={trade.isBuyerMaker ? "[#00c278e6]" : "[#F6465D]"} key={index} />
                    )
                }
            </>

        </div>

    )
}

const TableHeader = () => {
    return (
        <div className="flex flex-row justify-between items-center h-[32px] px-3 py-2">
            <div className="flex h-full w-[18%] items-center text-[12px] text-[#848E9C]">Price</div>
            <div className="flex h-full w-[35%] items-center justify-end text-[12px] text-[#848E9C]">Size</div>
            <div className="flex h-full w-[35%] items-center justify-end text-[12px] text-[#848E9C]">Time</div>
        </div>
    );
}


const Bid = ({ price, size, time, color }: { price: string; size: string; time: string; color: string }) => {
    return (

        <div className="flex flex-row justify-between items-center h-[23px] mx-3">
            <div className={`flex h-full w-[20%] items-center text-xs font-normal tabular-nums text-${color}/90`}>
                {price}
            </div>
            <div className="flex h-full w-[35%] items-center justify-end text-xs font-normal tabular-nums text-[#EAECEF]/80">
                {size}
            </div>
            <div className="flex h-full w-[35%] items-center justify-end text-xs font-normal tabular-nums text-[#EAECEF]/80">
                {time}
            </div>
        </div>
    )
}

export default Trades