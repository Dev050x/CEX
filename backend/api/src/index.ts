import express from "express";
import cors from "cors";
import { orderRouter } from "./routes/order.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/order",orderRouter);

app.listen(3000, () => {
    console.log(`hello from the server ${3000}`);
})



