import Header from "./Components/Header";

export default async function Home() {

  return (
    <div className="bg-[#0B0E11] flex flex-col max-h-screen min-h-screen overflow-y-hidden gap-2">
      <div className="bg-[#181a20] sticky top-0 z-20 w-full">
        <Header />
      </div>
      <div className="bg-[#181A20] text-high-emphasis flex flex-1 flex-col justify-between overflow-auto mx-25">
            <div className="flex flex-row h-full w-full flex-1 gap-2 px-4">
              <div className="flex flex-col flex-1 border gap-1">
                <div className="border h-16">Market Bar</div>
                <div className="flex flex-row flex-1 border">
                  <div className="border w-[380px]">orderbook</div>
                  <div className="border flex flex-col flex-1">
                    <div className="border h-[524px]">Trading View</div>
                    <div className="border flex-1">Swap UI</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-[380px] border">
                <div className="border h-[419px]">Coins</div>
                <div className="border flex-1">Recent Trades</div>
              </div>
            </div>
      </div>
    </div>
  );
}
