import { useParams } from "react-router-dom";
import { Message } from "@convo-ai/shared";
import { invariant } from "@convo-ai/shared";
import { chat } from "@/api.ts";
import { MessageForm, type OnSubmit } from "@/components/message-form";
import { Messages } from "@/components/messages";
import { kvStore, useKVStoreValue } from "@/lib/kv-store";
import { Conversation } from "@/types";

export function ConversationView() {
    const { conversationId } = useParams<{ conversationId?: string }>();

    invariant(conversationId, "conversationId must be defined");

    const conversationStorageKey = `conversation-${conversationId}` as const;

    const conversation = useKVStoreValue(
        conversationStorageKey,
        conversationId
            ? { id: conversationId, title: "", messages: [] }
            : { id: "", title: "", messages: [] }
    );

    const handleSubmit: OnSubmit = async ({ content, model }) => {
        invariant(conversation, "Conversation must be defined");

        const newMessages: Message[] = [
            ...conversation.messages,
            { role: "user", content },
        ];
        const updatedConv: Conversation = {
            ...conversation,
            messages: newMessages,
        };
        await kvStore.setItem(conversationStorageKey, updatedConv);
        chat(conversationStorageKey, {
            messages: newMessages,
            model,
        });
    };

    return (
        <div className="flex h-screen flex-col">
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-12 p-4">
                    <Messages messages={conversation.messages} />
                </div>
            </div>
            <div className="mx-auto w-full max-w-2xl px-4 pb-4">
                <MessageForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
