import { Router } from "express";
import {
    MODELS,
    Model,
    ROLES,
    conversationReqBodySchema,
    invariant,
    models,
    tryCatch,
} from "@convo-ai/shared";
import { BLAME_WHO } from "@/enums";
import { SSEEmitter } from "@/lib/sse-emitter";
import { SSEError } from "@/lib/sse-error";
import { validate } from "@/lib/validate";
import { chat } from "@/services/chat/chat";
import { logger } from "@/services/logger";

const router = Router();

router.get("/status", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

router.post("/conversation", async (req, res, next) => {
    const { model, messages } = validate(conversationReqBodySchema, req.body);

    const sse = new SSEEmitter(res);

    sse.setupHeaders();

    const lastUserMessage = messages.at(-1);

    invariant(lastUserMessage, "lastUserMessage must be defined");

    // Initialize selectedModel with the user-provided model
    let selectedModel = model;

    // If auto mode is specified, use the model selection logic
    if (model === "auto") {
        const modelSelectionResult = await chat.pickModel(
            lastUserMessage.content
        );

        if (modelSelectionResult.isErr()) {
            const { message, blameWho, originalError } =
                modelSelectionResult.error;
            logger.log({
                severity: logger.SEVERITIES.Error,
                message,
                blameWho,
                originalError,
            });
            // Fallback to a default model if auto-selection fails
            selectedModel = MODELS["gpt-4.1"];
            logger.log({
                severity: logger.SEVERITIES.Info,
                message: `Auto model selection failed, falling back to: ${selectedModel}`,
            });
        } else {
            selectedModel = modelSelectionResult.value;
            logger.log({
                severity: logger.SEVERITIES.Info,
                message: `Auto-selected model: ${selectedModel}`,
            });
        }
    }

    invariant(
        models.includes(selectedModel as Model),
        "selectedModel must be one of the supported models"
    );

    const completionResult = await tryCatch(
        chat.createCompletion({ model: selectedModel as Model, messages })
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

    sse.modelInfo(selectedModel);

    const streamingResult = await tryCatch(async () => {
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (typeof content !== "string") continue;

            fullResponseContent += content;
            sse.delta(content);
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
            model: MODELS["gpt-4.1-nano"],
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
        sse.conversationName(conversationName);
    }

    sse.end();
});

export default router;
