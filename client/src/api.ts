import { env } from "@/env";
import { PostEventSource } from "@/lib/PostEventSource.ts";
import invariant from "@/lib/invariant.ts";
import KVStorage from "@/lib/kv-storage/KVStorage.ts";
import { upsertAssistantResponseMessage } from "@/lib/upsertAssistantResponseMessage.ts";
import { ConversationStorageKey, RequestBody } from "@/types";

export async function chat(
    conversationStorageKey: ConversationStorageKey,
    body: RequestBody
) {
    const eventSource = new PostEventSource(`${env.VITE_API_DOMAIN}/stream`, {
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    eventSource.addEventListener("delta", (event) => {
        KVStorage.updateItem(conversationStorageKey, (prevConversation) => {
            invariant(
                prevConversation,
                "Previous conversation must be defined"
            );
            invariant(
                event instanceof MessageEvent,
                "Event must be a MessageEvent"
            );

            return {
                ...prevConversation,
                messages: upsertAssistantResponseMessage(
                    prevConversation.messages,
                    event.data
                ),
            };
        });
    });
}
