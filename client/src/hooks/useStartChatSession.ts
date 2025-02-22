import invariant from "@/lib/invariant.ts";
import KVStorage from "@/lib/kv-storage/KVStorage.ts";
import { upsertAssistantResponseMessage } from "@/lib/upsertAssistantResponseMessage.ts";
import { ResponseSchema } from "@/schemas.ts";
import { ConversationStorageKey, Message, Model } from "@/types.ts";

export function useStartChatSession() {
    const connect = ({
        conversationStorageKey,
        messages,
        model,
    }: {
        conversationStorageKey: ConversationStorageKey;
        messages: Message[];
        model: Model;
    }) => {
        const ws = new WebSocket("ws://localhost:8000/ws");

        ws.onopen = () => {
            console.debug("Connected to websocket");
            ws.send(
                JSON.stringify({
                    model,
                    messages,
                })
            );
        };

        ws.onmessage = (event) => {
            if (event.data === "[DONE]") {
                console.debug("Done");
                ws.close();
                return;
            }

            const response = JSON.parse(event.data);
            console.debug("Message received", response);

            const validatedResponse = ResponseSchema.parse(response);

            KVStorage.updateItem(conversationStorageKey, (oldValue) => {
                invariant(oldValue, "Conversation must be defined");

                return {
                    ...oldValue,
                    messages: upsertAssistantResponseMessage(
                        oldValue.messages,
                        validatedResponse.v
                    ),
                };
            });
        };

        ws.onclose = () => {
            console.debug("Disconnected from websocket");
        };

        ws.onerror = (error) => {
            console.error("Websocket error:", error);
        };
    };

    return { connect };
}
