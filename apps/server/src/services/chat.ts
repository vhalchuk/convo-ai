import { invariant } from "@epic-web/invariant";
import OpenAI from "openai";
import { Message, Model } from "@convo-ai/shared";
import { env } from "@/env";
import { logger } from "@/services/logger";
import { Service } from "@/services/service-interface";

type ChatCompletionCreateParams = {
    messages: Message[];
    model: Model;
};

class Chat implements Service {
    name = "ChatService";

    private openaiClient: OpenAI | null = null;
    private isInitialized = false;

    initialize() {
        if (this.isInitialized) {
            logger.log({
                severity: logger.SEVERITIES.Warn,
                message: `${this.name} is already initialized.`,
            });
            return;
        }
        this.openaiClient = new OpenAI({
            apiKey: env.OPENAI_API_KEY,
        });
        this.isInitialized = true;
    }

    public createCompletion(params: ChatCompletionCreateParams) {
        invariant(
            this.isInitialized,
            `${this.name} must be initialized before use. Call initialize() first.`
        );
        invariant(
            this.openaiClient,
            "OpenAI client is not initialized. This should not happen if initialize() was called."
        );

        const { model, messages } = params;

        return this.openaiClient.chat.completions.create({
            messages,
            model,
            stream: true,
        });
    }
}

export const chat = new Chat();
