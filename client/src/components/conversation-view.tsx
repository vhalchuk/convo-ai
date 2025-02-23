import { useParams } from "react-router-dom";
import { chat } from "@/api.ts";
import { MessageForm, type OnSubmit } from "@/components/message-form";
import { Messages } from "@/components/messages";
import invariant from "@/lib/invariant";
import KVStorage from "@/lib/kv-storage/KVStorage";
import useKVStorageValue from "@/lib/kv-storage/useKVStorageValue";
import { Conversation, Message } from "@/types";

export function ConversationView() {
    const { conversationId } = useParams<{ conversationId?: string }>();

    invariant(conversationId, "conversationId must be defined");

    const conversationStorageKey = `conversation-${conversationId}` as const;

    const conversation = useKVStorageValue(
        conversationStorageKey,
        conversationId
            ? { id: conversationId, title: "", messages: [] }
            : { id: "", title: "", messages: [] }
    );

    const handleSubmit: OnSubmit = async ({ content, model }) => {
        const newMessages: Message[] = [
            ...conversation.messages,
            { role: "user", content },
        ];
        const updatedConv: Conversation = {
            ...conversation,
            messages: newMessages,
        };
        await KVStorage.setItem(conversationStorageKey, updatedConv);
        void chat(conversationStorageKey, {
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
