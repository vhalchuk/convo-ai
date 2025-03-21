import { useNavigate } from "react-router-dom";
import { ROLES } from "@convo-ai/shared";
import { chat } from "@/api.ts";
import { MessageForm, type OnSubmit } from "@/components/message-form";
import { db } from "@/lib/db.ts";

export function EmptyConversationView() {
    const navigate = useNavigate();

    const handleSubmit: OnSubmit = async ({ content, model }) => {
        const conversationId = crypto.randomUUID();
        const messageId = crypto.randomUUID();

        // Use a placeholder title initially (will be replaced by AI-generated title)
        const placeholderTitle = "New conversation";

        await db.transaction("rw", db.conversations, db.messages, async () => {
            const now = Date.now();
            await db.conversations.add({
                id: conversationId,
                title: placeholderTitle,
                createdAt: now,
                lastMessageAt: now,
            });
            await db.messages.add({
                id: messageId,
                conversationId,
                content,
                createdAt: now,
                role: ROLES.USER,
            });
        });

        void chat(conversationId, {
            messages: [{ role: ROLES.USER, content }],
            model,
        });

        void navigate(`/${conversationId}`, { replace: true });
    };

    return (
        <div className="flex h-screen flex-col">
            <h2 className="prose prose-invert mx-auto flex max-w-2xl flex-1 items-center justify-center space-y-12 p-4 text-xl">
                Write a message to AI
            </h2>
            <div className="mx-auto w-full max-w-2xl px-4 pb-4">
                <MessageForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
