import { Router } from "express";
import { conversationReqBodySchema } from "@convo-ai/shared";
import { chat } from "@/services/chat";
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

    try {
        const stream = await chat.createCompletion({
            model,
            messages,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;

            if (typeof content !== "string") continue;

            const lines = content
                .split("\n")
                .map((line) => `data: ${line}\n`)
                .join("");
            res.write(`event: delta\n${lines}\n`);
        }
    } finally {
        res.write("data: [DONE]\n\n");
        res.end();
    }
});

export default router;
