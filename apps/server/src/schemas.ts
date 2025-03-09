import { z } from "zod";
import { models, roles } from "@/const";

export const modelSchema = z.enum(models);
export const messageSchema = z.object({
    content: z.string(),
    role: z.enum(roles)
});
export const conversationSchema = z.object({
    model: modelSchema,
    messages: z.array(messageSchema).min(1)
});