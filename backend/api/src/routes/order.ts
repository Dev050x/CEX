import { Router } from "express";
import { RedisManager } from "../RedisMananger.js";
import { CREATE_ORDER } from "../types/index.js";


export const orderRouter = Router();

orderRouter.post("/", async (req, res) => {
    const {market, price, quantity, side, userId } = req.body;
    console.log({market, price, quantity, side, userId });
    const response = await RedisManager.getInstance().sendAndAwait({
        type: CREATE_ORDER,
        data: {
            market,
            price, 
            quantity,
            side,
            userId
        }
    });
    res.json(response.payload);
});