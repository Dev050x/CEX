import Header from "./Components/Header";
import { getKlines, getTickers, getTrades } from "./utils/httpClient";

export default async function Home() {
  const data = await getTickers();
  console.log(data);
  return (
    <div className="flex flex-col max-h-screen min-h-screen overflow-y-hidden">
      <div className="bg-[#0e0f14] sticky top-0 z-20 w-full">
        <Header />
      </div>
      <div>Hero</div>
    </div>
  );
}
