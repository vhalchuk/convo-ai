import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "react-router-dom";
import { ROLES, invariant } from "@convo-ai/shared";
import { chat } from "@/api.ts";
import { MessageForm, type OnSubmit } from "@/components/message-form";
import { Messages } from "@/components/messages";
import { db } from "@/lib/db.ts";

export function ConversationView() {
    const { conversationId } = useParams<{ conversationId?: string }>();

    invariant(conversationId, "conversationId must be defined");

    const messages = useLiveQuery(
        () =>
            db.messages
                .where("[conversationId+createdAt]")
                .between([conversationId, 0], [conversationId, Infinity])
                .toArray(),
        [conversationId],
        []
    );

    const handleSubmit: OnSubmit = async ({ content, model }) => {
        const messageId = crypto.randomUUID();

        await db.transaction("rw", db.conversations, db.messages, async () => {
            const now = Date.now();
            await db.messages.add({
                id: messageId,
                conversationId,
                content,
                createdAt: now,
                role: ROLES.USER,
            });
            await db.conversations.update(conversationId, {
                lastMessageAt: now,
            });
        });

        void chat(conversationId, {
            messages: [...messages, { role: ROLES.USER, content }],
            model,
        });
    };

    return (
        <div className="flex h-screen flex-col">
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-12 p-4">
                    <Messages messages={messages} />
                </div>
            </div>
            <div className="mx-auto w-full max-w-2xl px-4 pb-4">
                <MessageForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
