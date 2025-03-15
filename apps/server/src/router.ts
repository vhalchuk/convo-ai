import { Router } from "express";
import { conversationReqBodySchema, tryCatch } from "@convo-ai/shared";
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

    const result = await tryCatch(async () => {
        const stream = await chat.createCompletion({ model, messages });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (typeof content !== "string") continue;

            const lines = content
                .split("\n")
                .map((line) => `data: ${line}\n`)
                .join("");
            res.write(`event: delta\n${lines}\n`);
        }
    });

    if (result.isErr()) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: `Error during SSE streaming: ${result.error}`,
        });
    }

    res.write("data: [DONE]\n\n");
    res.end();
});

export default router;
