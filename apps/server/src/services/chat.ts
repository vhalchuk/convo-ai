import { invariant } from "@epic-web/invariant";
import OpenAI from "openai";
import { Message, Model, ROLES } from "@convo-ai/shared";
import { env } from "@/env";
import { logger } from "@/services/logger";
import { Service } from "@/services/service-interface";

type ChatCompletionCreateParams = {
    messages: Message[];
    model: Model;
};

type GenerateConversationNameParams = {
    model: Model;
    userMessage: string;
    assistantResponse: string;
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

    public async generateConversationName(
        params: GenerateConversationNameParams
    ) {
        invariant(
            this.isInitialized,
            `${this.name} must be initialized before use. Call initialize() first.`
        );
        invariant(
            this.openaiClient,
            "OpenAI client is not initialized. This should not happen if initialize() was called."
        );

        const { model, userMessage, assistantResponse } = params;

        const completion = await this.openaiClient.chat.completions.create({
            messages: [
                {
                    role: ROLES.SYSTEM,
                    content:
                        "You are a helpful assistant that generates concise, descriptive conversation titles. Create a short, engaging title (maximum 40 characters) that captures the essence of the conversation based on the user's message and your response.",
                },
                {
                    role: ROLES.USER,
                    content: userMessage,
                },
                {
                    role: ROLES.ASSISTANT,
                    content: assistantResponse,
                },
                {
                    role: ROLES.USER,
                    content:
                        "Based on our conversation, please generate a short, descriptive title for this chat (maximum 40 characters, no quotes).",
                },
            ],
            model,
            stream: false,
            max_tokens: 30,
        });

        return completion.choices[0]?.message?.content || "New conversation";
    }
}

export const chat = new Chat();
