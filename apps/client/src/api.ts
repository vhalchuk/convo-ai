import { ConversationReqBody, ROLES } from "@convo-ai/shared";
import { invariant } from "@convo-ai/shared";
import { env } from "@/env";
import { PostEventSource } from "@/lib/PostEventSource.ts";
import { db } from "@/lib/db.ts";

export async function chat(conversationId: string, body: ConversationReqBody) {
    const eventSource = new PostEventSource(
        `${env.VITE_API_DOMAIN}/conversation`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    );

    let buffer = "";
    const messageId = crypto.randomUUID();

    let assistantMessageId: string;

    await db.transaction("rw", db.conversations, db.messages, async () => {
        const now = Date.now();
        assistantMessageId = await db.messages.add({
            id: messageId,
            conversationId,
            role: ROLES.ASSISTANT,
            content: buffer,
            createdAt: now,
        });
        await db.conversations.update(conversationId, {
            lastMessageAt: now,
        });
    });

    eventSource.addEventListener("delta", (event) => {
        invariant(
            event instanceof MessageEvent,
            "Event must be a MessageEvent"
        );
        invariant(
            typeof event.data === "string",
            "Event data must be a string"
        );

        buffer += event.data;
        void db.messages.update(assistantMessageId, {
            content: buffer,
            updatedAt: Date.now(),
        });
    });
}
