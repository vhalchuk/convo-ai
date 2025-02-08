import { ChatResponse, RequestBody } from "@/types.ts";
import { env } from "@/env.ts";

export async function chat(body: RequestBody): Promise<ChatResponse> {
    const response = await fetch(env.VITE_API_DOMAIN, {
        method: "POST",
        body: JSON.stringify(body),
    });

    const content = await response.json();

    return content as ChatResponse;
}
