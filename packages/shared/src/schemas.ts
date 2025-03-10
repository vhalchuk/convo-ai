import { z } from "zod";
import { models, roles } from "./enums";

export const modelSchema = z.enum(models);
export const messageSchema = z.object({
    content: z.string(),
    role: z.enum(roles)
});

export const conversationReqBodySchema = z.object({
    model: modelSchema,
    messages: z.array(messageSchema).min(1)
});
export type ConversationReqBody = z.infer<typeof conversationReqBodySchema>;