import { ConversationReqBody, ROLES, SSE_EVENTS } from "@convo-ai/shared";
import { env } from "@/env";
import { PostEventSource } from "@/lib/PostEventSource.ts";
import { db } from "@/lib/db.ts";

export async function chat(conversationId: string, body: ConversationReqBody) {
    const eventSource = new PostEventSource(
        `${env.CLIENT_API_DOMAIN ?? ""}/api/conversation`,
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

    eventSource.addEventListener(SSE_EVENTS.MODEL_INFO, (event) => {
        void db.messages.update(assistantMessageId, {
            model: event.data,
            updatedAt: Date.now(),
        });
    });

    eventSource.addEventListener(SSE_EVENTS.DELTA, (event) => {
        buffer += event.data;
        void db.messages.update(assistantMessageId, {
            content: buffer,
            updatedAt: Date.now(),
        });
    });

    // Handle conversation name event from the server
    eventSource.addEventListener(SSE_EVENTS.CONVERSATION_NAME, (event) => {
        // Update the conversation title with the AI-generated name
        void db.conversations.update(conversationId, {
            title: event.data,
            updatedAt: Date.now(),
        });
    });

    // Handle message completion
    eventSource.addEventListener(SSE_EVENTS.MESSAGE, (event) => {
        if (event.data === "[DONE]") {
            eventSource.close();
        }
    });

    // Handle error events
    eventSource.addEventListener(SSE_EVENTS.SERVER_ERROR, (event) => {
        console.error(`SSE error:`, event.data);
    });
    eventSource.addEventListener(SSE_EVENTS.ERROR, (event) => {
        console.error("Unexpected SSE error:", event.data);
    });
}
