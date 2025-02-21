import { env } from "@/env";
import { ChatResponse, RequestBody } from "@/types";

export async function chat(body: RequestBody): Promise<ChatResponse> {
    const response = await fetch(env.VITE_API_DOMAIN, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
    });

    const content = await response.json();

    return content as ChatResponse;
}
