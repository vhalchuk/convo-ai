import { z } from "zod";
import { ROLES } from "@/constants.ts";
import { Role } from "@/types.ts";

export const MessageSchema = z.object({
    role: z.enum(Object.values(ROLES) as [Role]),
    content: z.string(),
});

export const ResponseSchema = z.union([
    z.object({ message: MessageSchema }),
    z.object({ status: z.literal("[DONE]") }),
]);
