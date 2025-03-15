import { ROLES } from "@convo-ai/shared";
import { Message } from "@convo-ai/shared";
import { invariant } from "@convo-ai/shared";

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
