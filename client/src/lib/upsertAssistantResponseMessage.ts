import { ROLES } from "@/constants.ts";
import invariant from "@/lib/invariant.ts";
import { Message } from "@/types.ts";

export function upsertAssistantResponseMessage(
    messages: Message[],
    content: string
) {
    const lastMessage = messages.at(-1);

    invariant(lastMessage, "Messages must not be empty");

    if (lastMessage.role === ROLES.ASSISTANT) {
        return [
            ...messages.slice(0, -1),
            {
                ...lastMessage,
                content: lastMessage.content + content,
            },
        ];
    }

    return [
        ...messages,
        {
            role: ROLES.ASSISTANT,
            content,
        },
    ];
}
