import { z } from "zod";
import { ResponseSchema } from "@/schemas.ts";
import { Message } from "@/types.ts";

export function isMessageResponse(
    response: z.infer<typeof ResponseSchema>
): response is { message: Message } {
    return "message" in response;
}
