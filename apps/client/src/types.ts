import { type Message } from "@convo-ai/shared";

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
