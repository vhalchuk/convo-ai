import invariant from "@/lib/invariant.ts";
import { Message } from "@/types.ts";

export function upsertAssistantResponseMessage(
    messages: Message[],
    message: Message
) {
    const lastMessage = messages.at(-1);

    invariant(lastMessage, "Messages must not be empty");

    if (lastMessage.role === "assistant") {
        return [...messages.slice(0, -1), message];
    }

    return [...messages, message];
}
