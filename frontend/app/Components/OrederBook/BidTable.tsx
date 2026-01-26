const BidTable = ({ bids }: { bids: [string, string][] }) => {
    let currentTotal = 0;
    console.log("bids are: ", bids);
    let relavantBids = bids.slice(0, 15);
    let bidWithTotal: [string, string, number][] = [];
    relavantBids.map(([price, size]) => {
        bidWithTotal.push([price, size, currentTotal += parseFloat(size)]);
    })
    return (
        <>
            {bidWithTotal.map(([price, size, total], index) => {
                return <Bid key={index} price={price} size={size} total={total.toFixed(2)} />;
            })}
        </>
    );
}

const Bid = ({ price, size, total }: { price: string; size: string; total: string }) => {
    return (
        <div className="flex flex-row justify-between items-center h-[23px] mx-3">
            <div className="flex h-full w-[30%] items-center text-xs font-normal tabular-nums text-[#00c278e6]/90">
                {price}
            </div>
            <div className="flex h-full w-[35%] items-center justify-end text-xs font-normal tabular-nums text-[#EAECEF]/80">
                {size}
            </div>
            <div className="flex h-full w-[35%] items-center justify-end text-xs font-normal tabular-nums text-[#EAECEF]/80">
                {total}
            </div>
        </div>
    )
}

export default BidTable;
