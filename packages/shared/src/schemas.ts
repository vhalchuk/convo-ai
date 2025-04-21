import { z } from "zod";
import { MODELS, ROLES, SSE_EVENTS } from "./enums";

export const reqModelSchema = z.nativeEnum({
    ...MODELS,
    auto: "auto",
} as const);
export const messageSchema = z.object({
    content: z.string(),
    role: z.nativeEnum(ROLES),
});

export const conversationReqBodySchema = z.object({
    model: reqModelSchema,
    messages: z.array(messageSchema).min(1),
});
export type ConversationReqBody = z.infer<typeof conversationReqBodySchema>;

export const sseEventsSchema = z.nativeEnum(SSE_EVENTS);
