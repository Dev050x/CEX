"use client"
import { useEffect, useState } from "react";
import { getDepth, getTicker } from "../../utils/httpClient";
import AskTable from "./AskTable";
import BidTable from "./BidTable";

const OrderBook = ({ market }: { market: string }) => {
    const [bids, setBids] = useState<[string, string][] | null>(null);
    const [asks, setAsks] = useState<[string, string][] | null>(null);
    const [lastPrice, setLastPrice] = useState<string | null>(null);
    useEffect(() => {
        const getDepthData = async () => {
            const depth = await getDepth(market);
            setAsks(depth.asks);
            setBids(depth.bids.reverse());
            const ticker = await getTicker(market);
            const lastPrice = ticker?.lastPrice;
            setLastPrice(lastPrice || null);
        }
        getDepthData();
    }, [market]);

    return (
        <div className="flex flex-col ">
            <div className="h-[42px] py-3 mx-3 text-[#EAECEF] font-bold">
                OderBook
            </div>
            <hr className="text-[#424755]" />
            <TableHeader />
            <div>{asks && <AskTable asks={asks} />}</div>
            <PriceBar lastPrice={lastPrice} />
            <div>{bids && <BidTable bids={bids} />}</div>
        </div>
    )
}


const TableHeader = () => {
    return (
        <div className="flex flex-row justify-between items-center h-[32px] px-3 py-2">
            <div className="flex h-full w-[30%] items-center text-[12px] text-[#848E9C]">Price</div>
            <div className="flex h-full w-[35%] items-center justify-end text-[12px] text-[#848E9C]">Size</div>
            <div className="flex h-full w-[35%] items-center justify-end text-[12px] text-[#848E9C]">Total</div>
        </div>
    );
}

const PriceBar = ({ lastPrice }: { lastPrice: string | null }) => {
    return (
        <div className="sticky bottom-0 z-10 flex flex-col px-3 py-1 ">
            <div className="flex justify-between">
                <div className="flex items-center gap-1.5">
                    <button type="button" className="hover:opacity-90">
                        <p className="font-medium tabular-nums text-[#F6465D] font-bold">
                            {lastPrice}
                        </p>
                    </button>
                </div>

                <button
                    type="button"
                    className="text-xs font-medium text-[#1E90FF] hover:opacity-80"
                >
                    Recenter
                </button>
            </div>
        </div>
    )
}


export default OrderBook

