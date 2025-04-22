import { invariant } from "@epic-web/invariant";
import { err, ok } from "neverthrow";
import OpenAI from "openai";
import { z } from "zod";
import { MODELS, Message, Model, ROLES, tryCatch } from "@convo-ai/shared";
import { BLAME_WHO, MODEL_TIERS, TOKEN_IDS } from "@/enums";
import { getEnv } from "@/env";
import { EnhancedError } from "@/lib/enhanced-error";
import { renderPrompt } from "@/lib/render-prompt";
import { logger } from "@/services/logger";
import { Service } from "@/services/service-interface";
import namePromptPath from "./generate-conversation-name.md";
import modelPromptPath from "./pick-model.md";

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
            apiKey: getEnv().OPENAI_API_KEY,
        });
        this.isInitialized = true;
    }

    private validateInitialization() {
        invariant(
            this.isInitialized,
            `${this.name} must be initialized before use. Call initialize() first.`
        );
        invariant(
            this.openaiClient,
            "OpenAI client is not initialized. This should not happen if initialize() was called."
        );

        return this.openaiClient;
    }

    public createCompletion(params: ChatCompletionCreateParams) {
        const openaiClient = this.validateInitialization();

        const { model, messages } = params;

        return openaiClient.chat.completions.create({
            messages,
            model,
            stream: true,
        });
    }

    public async generateConversationName(
        params: GenerateConversationNameParams
    ) {
        const openaiClient = this.validateInitialization();

        const { model, userMessage, assistantResponse } = params;

        const promptUrl = new URL(namePromptPath, import.meta.url);
        const promptResult = await tryCatch(renderPrompt(promptUrl));

        if (promptResult.isErr()) {
            return err(
                new EnhancedError({
                    blameWho: BLAME_WHO.SERVER,
                    message:
                        "Failed to get prompt for generating conversation name",
                    originalError: promptResult.error,
                })
            );
        }

        const result = await tryCatch(
            openaiClient.chat.completions.create({
                messages: [
                    {
                        role: ROLES.SYSTEM,
                        content: promptResult.value,
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
                max_completion_tokens: 30,
            })
        );

        if (result.isErr()) {
            return err(
                new EnhancedError({
                    blameWho: BLAME_WHO.SERVICE,
                    message: "Failed to generate conversation name",
                    originalError: result.error,
                })
            );
        }

        if (!result.value.choices[0]?.message?.content) {
            return err(
                new EnhancedError({
                    blameWho: BLAME_WHO.SERVICE,
                    message: "OpenAI response did not contain expected content",
                })
            );
        }

        return ok(result.value.choices[0].message.content);
    }

    public async pickModel(lastMessage: string) {
        const openaiClient = this.validateInitialization();

        const promptUrl = new URL(modelPromptPath, import.meta.url);
        const promptResult = await tryCatch(renderPrompt(promptUrl));

        if (promptResult.isErr()) {
            return err(
                new EnhancedError({
                    blameWho: BLAME_WHO.SERVER,
                    message: "Failed to get prompt for model selection",
                    originalError: promptResult.error,
                })
            );
        }

        const completionResult = await tryCatch(
            openaiClient.chat.completions.create({
                messages: [
                    {
                        role: ROLES.SYSTEM,
                        content: promptResult.value,
                    },
                    {
                        role: ROLES.USER,
                        content: lastMessage,
                    },
                ],
                model: MODELS["gpt-4.1-nano"],
                stream: false,
                max_completion_tokens: 2,
                temperature: 0,
                stop: ["\n"],
                logit_bias: {
                    [TOKEN_IDS.direct]: 100,
                    [TOKEN_IDS.reason]: 100,
                    [TOKEN_IDS["-lite"]]: 100,
                    [TOKEN_IDS["-pro"]]: 100,
                },
            })
        );

        if (completionResult.isErr()) {
            return err(
                new EnhancedError({
                    blameWho: BLAME_WHO.SERVICE,
                    message: "OpenAI API error while selecting model tier",
                    originalError: completionResult.error,
                })
            );
        }

        if (!completionResult.value.choices[0]?.message.content) {
            return err(
                new EnhancedError({
                    blameWho: BLAME_WHO.SERVICE,
                    message:
                        "OpenAI response did not contain selected model tier",
                })
            );
        }

        const modelTier = completionResult.value.choices[0].message.content;
        const parsedModelTier = z.nativeEnum(MODEL_TIERS).safeParse(modelTier);

        if (parsedModelTier.error) {
            return err(
                new EnhancedError({
                    blameWho: BLAME_WHO.SERVICE,
                    message: `Unexpected model tier "${modelTier}"`,
                })
            );
        }

        const modelMapping: Record<string, Model> = {
            "direct-lite": MODELS["gpt-4.1-nano"],
            "direct-pro": MODELS["gpt-4.1"],
            "reason-lite": MODELS["o4-mini"],
            "reason-pro": MODELS["o3"],
        };

        const selectedModel = modelMapping[parsedModelTier.data];

        invariant(selectedModel, "selectedModel must be defined");

        return ok(selectedModel);
    }
}

export const chat = new Chat();
