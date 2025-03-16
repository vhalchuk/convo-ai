import { type Message } from "@convo-ai/shared";

export type Conversation = { id: string; title: string; messages: Message[] };
export type ConversationListItem = Pick<Conversation, "id" | "title">;

export type ConversationStoreKey = `conversation-${string}`;
export type KVStoreKey = "conversation-list" | ConversationStoreKey;
export type KVStoreValue<T extends KVStoreKey> = T extends "conversation-list"
    ? ConversationListItem[]
    : T extends `conversation-${string}`
      ? Conversation
      : never;
