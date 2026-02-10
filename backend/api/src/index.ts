import express from "express";
import cors from "cors";
import { orderRouter } from "./routes/order.js";
import { depthRouter } from "./routes/depth.js";
import { klineRouter } from "./routes/kline.js";
import { tickersRouter } from "./routes/ticker.js";
import { tradesRouter } from "./routes/trades.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/order",orderRouter);
app.use("/api/v1/depth", depthRouter);
app.use("/api/v1/klines", klineRouter);
app.use("/api/v1/tickers", tickersRouter);
app.use("/api/v1/trades", tradesRouter);

app.listen(3000, () => {
    console.log(`hello from the server ${3000}`);
})



