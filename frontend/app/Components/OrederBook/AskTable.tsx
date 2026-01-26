const AskTable = ({ asks }: { asks: [string, string][] }) => {
    let currentTotal = 0;
    let relavantAsks = asks.slice(0, 15);
    let askWithTotal: [string, string, number][] = [];
    relavantAsks.map(([price, size]) => {
        askWithTotal.push([price, size, currentTotal += parseFloat(size)]);
    })
    askWithTotal.reverse();
    return (
        <>
            {askWithTotal.map(([price, size, total], index) => {
                return <Ask key={index} price={price} size={size} total={total.toFixed(2)} />;
            })}
        </>
    );
}

const Ask = ({ price, size, total }: { price: string; size: string; total: string }) => {
    return (
        <div className="flex flex-row justify-between items-center h-[23px] mx-3">
            <div className="flex h-full w-[30%] items-center text-xs font-normal tabular-nums text-[#F6465D]/90">
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

export default AskTable;