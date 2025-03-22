import { Router } from "express";
import { ROLES, conversationReqBodySchema, tryCatch } from "@convo-ai/shared";
import { BLAME_WHO } from "@/enums";
import { chat } from "@/services/chat";
import { SSEError } from "@/utils/sse-error";
import { validate } from "@/utils/validate";

const router = Router();

router.get("/status", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

router.post("/conversation", async (req, res, next) => {
    const { model, messages } = validate(conversationReqBodySchema, req.body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await new Promise((res) => setTimeout(res, 50));

    const completionResult = await tryCatch(
        chat.createCompletion({ model, messages })
    );

    if (completionResult.isErr()) {
        next(
            new SSEError({
                message: "Failed to initialize chat completion",
                blameWho: BLAME_WHO.SERVICE,
                originalError: completionResult.error,
            })
        );
        return;
    }

    const { value: stream } = completionResult;

    let fullResponseContent = "";

    const streamingResult = await tryCatch(async () => {
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
    });

    if (streamingResult.isErr()) {
        next(
            new SSEError({
                message: "SSE streaming failure",
                blameWho: BLAME_WHO.SERVICE,
                originalError: streamingResult.error,
            })
        );
        return;
    }

    // Check if this is the first message in the conversation
    const isFirstMessage =
        messages.filter((m) => m.role === ROLES.USER).length === 1;
    // If this is the first message, generate a conversation name
    if (isFirstMessage) {
        const userMessage =
            messages.find((m) => m.role === ROLES.USER)?.content || "";
        const conversationNameResult = await chat.generateConversationName({
            model,
            userMessage,
            assistantResponse: fullResponseContent,
        });

        if (conversationNameResult.isErr()) {
            next(
                new SSEError({
                    message: "Failed to initialize chat completion",
                    blameWho: BLAME_WHO.SERVICE,
                    originalError: conversationNameResult.error,
                })
            );
            return;
        }

        const { value: conversationName } = conversationNameResult;

        // Send the conversation name as a special event
        res.write(`event: conversation_name\ndata: ${conversationName}\n\n`);
    }

    res.end("data: [DONE]\n\n");
});

export default router;
