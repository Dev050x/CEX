import { createClient } from "redis"
import { Engine } from "./trade/Engine.js";


async function main() {
    const redisClient = createClient();
    redisClient.connect();
    const engine = new Engine();
    while (true) {
        let response = await redisClient.rPop("messages"); {
            if (response) {
                engine.process(JSON.parse(response));
            }
        }
    }
}