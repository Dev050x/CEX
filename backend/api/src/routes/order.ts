import { Router } from "express";


export const orderRouter = Router();

orderRouter.post("/", (req, res) => {
    console.log("we have received your order");
    res.json(
        {
            "status": "200",
            "message": "we've received your request"
        }
    )
})