import { Router } from "express";
import { ROLES, conversationReqBodySchema, tryCatch } from "@convo-ai/shared";
import { chat } from "@/services/chat";
import { logger } from "@/services/logger";
import { validate } from "@/utils/validate";

const router = Router();

router.get("/status", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

router.post("/conversation", async (req, res) => {
    const { model, messages } = validate(conversationReqBodySchema, req.body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Check if this is the first message in the conversation
    const isFirstMessage =
        messages.filter((m) => m.role === ROLES.USER).length === 1;
    let fullResponseContent = "";

    const result = await tryCatch(async () => {
        const stream = await chat.createCompletion({ model, messages });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (typeof content !== "string") continue;

            fullResponseContent += content;

            const lines = content
                .split("\n")
                .map((line) => `data: ${line}\n`)
                .join("");
            res.write(`event: delta\n${lines}\n`);
        }

        // If this is the first message, generate a conversation name
        if (isFirstMessage) {
            const userMessage =
                messages.find((m) => m.role === ROLES.USER)?.content || "";
            const conversationName = await chat.generateConversationName({
                model,
                userMessage,
                assistantResponse: fullResponseContent,
            });

            // Send the conversation name as a special event
            res.write(
                `event: conversation_name\ndata: ${conversationName}\n\n`
            );
        }
    });

    if (result.isErr()) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: `Error during SSE streaming: ${result.error}`,
        });
        res.write(`event: error\ndata: ${result.error}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
});

export default router;
