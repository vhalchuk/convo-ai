import { ChatResponse, RequestBody } from "@/types.ts";

export async function chat(body: RequestBody): Promise<ChatResponse> {
    const response = await fetch("/api", {
        method: "POST",
        body: JSON.stringify(body),
    });

    const content = await response.json();

    return content as ChatResponse;
}
