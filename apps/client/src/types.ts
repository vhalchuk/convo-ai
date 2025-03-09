import { MODELS, ROLES } from "@/constants";

export type Model = (typeof MODELS)[keyof typeof MODELS];

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type Message = {
    role: "user" | "assistant";
    content: string;
};

export type RequestBody = {
    messages: Message[];
    model: Model;
};

export type ChatResponse = {
    messages: Message[];
};

export type Conversation = { id: string; title: string; messages: Message[] };
export type ConversationListItem = Pick<Conversation, "id" | "title">;

export type ConversationStorageKey = `conversation-${string}`;
export type KVStorageKey = "conversation-list" | ConversationStorageKey;
export type KVStorageValue<T extends KVStorageKey> =
    T extends "conversation-list"
        ? ConversationListItem[]
        : T extends `conversation-${string}`
          ? Conversation
          : never;
