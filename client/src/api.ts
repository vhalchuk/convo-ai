import { ChatResponse, Message } from "./types.ts";

export async function chat(messages: Message[]): Promise<ChatResponse> {
    const response = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({
            messages,
        }),
    });

    const content = await response.json();

    return content as ChatResponse;
}
