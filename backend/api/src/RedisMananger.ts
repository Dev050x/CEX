import { createClient, type RedisClientType } from "redis";
import type { MessageToEngine } from "./types/to.js";
import type { MessageFromOrderBook } from "./types/index.js";
import { v4 as uuid } from 'uuid';

export class RedisManager{
    private client: RedisClientType;
    private publisher: RedisClientType;
    private static instance:RedisManager;

    private constructor() {
        this.client = createClient();
        this.client.connect();
        this.publisher = createClient();
        this.publisher.connect();
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }

    public sendAndAwait(message: MessageToEngine) {
        return new Promise<MessageFromOrderBook>((resolve) => {
            const id = this.getRandomId();
            this.client.subscribe(id, (msg) => {
                this.client.unsubscribe(id);
                resolve(JSON.parse(msg));
            });
            this.publisher.lPush("messages", JSON.stringify({clientId: id, message}));
        });
    }

    public getRandomId() {
        return uuid();
    }


}