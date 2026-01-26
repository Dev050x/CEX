import { getKlines, getTickers, getTrades } from "./utils/httpClient";

export default async function Home() {
  const data = await getTickers();
  console.log(data);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
     
    </div>
  );
}
