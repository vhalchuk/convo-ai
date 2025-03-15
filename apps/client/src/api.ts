import { ConversationReqBody } from "@convo-ai/shared";
import { invariant } from "@convo-ai/shared";
import { env } from "@/env";
import { PostEventSource } from "@/lib/PostEventSource.ts";
import KVStorage from "@/lib/kv-storage/KVStorage.ts";
import { upsertAssistantResponseMessage } from "@/lib/upsertAssistantResponseMessage.ts";
import { ConversationStorageKey } from "@/types";

export function chat(
    conversationStorageKey: ConversationStorageKey,
    body: ConversationReqBody
) {
    const eventSource = new PostEventSource(
        `${env.VITE_API_DOMAIN}/conversation`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    );

    eventSource.addEventListener("delta", (event) => {
        void KVStorage.updateItem(
            conversationStorageKey,
            (prevConversation) => {
                invariant(
                    prevConversation,
                    "Previous conversation must be defined"
                );
                invariant(
                    event instanceof MessageEvent,
                    "Event must be a MessageEvent"
                );
                invariant(
                    typeof event.data === "string",
                    "Event data must be a string"
                );

                return {
                    ...prevConversation,
                    messages: upsertAssistantResponseMessage(
                        prevConversation.messages,
                        event.data
                    ),
                };
            }
        );
    });
}
