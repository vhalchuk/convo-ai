import Dexie from "dexie";
import { Message as BaseMessage } from "@convo-ai/shared";

type Conversation = {
    id: string;
    title: string;
    createdAt: number;
    updatedAt?: number;
    lastMessageAt: number;
};

type Message = BaseMessage & {
    id: string;
    conversationId: string;
    createdAt: number;
    updatedAt?: number;
};

class Database extends Dexie {
    conversations: Dexie.Table<Conversation, string>;
    messages: Dexie.Table<Message, string>;

    constructor() {
        super("db");
        this.version(1).stores({
            conversations: "++id, lastMessageAt",
            messages: "++id, conversationId, [conversationId+createdAt]",
        });
        this.conversations = this.table("conversations");
        this.messages = this.table("messages");
    }
}

export const db = new Database();
