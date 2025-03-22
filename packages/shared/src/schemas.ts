import { z } from "zod";
import { ROLES, SSE_EVENTS, models } from "./enums";

export const modelSchema = z.enum(models);
export const messageSchema = z.object({
    content: z.string(),
    role: z.nativeEnum(ROLES),
});

export const conversationReqBodySchema = z.object({
    model: modelSchema,
    messages: z.array(messageSchema).min(1),
});
export type ConversationReqBody = z.infer<typeof conversationReqBodySchema>;

export const sseEventsSchema = z.nativeEnum(SSE_EVENTS);
