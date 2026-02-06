import { createClient } from "redis"


async function main() {
    const redisClient = createClient();
    redisClient.connect();
    while (true) {
        let response = await redisClient.rPop("messages"); {
            if (response) {

            }
        }
    }
}