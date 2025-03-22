import { Response } from "express";
import { SSE_EVENTS } from "@convo-ai/shared";

export class SSEEmitter {
    private res: Response;

    constructor(res: Response) {
        this.res = res;
    }

    /**
     * Set up streaming headers
     */
    public setupHeaders(): void {
        this.res.setHeader("Content-Type", "text/event-stream");
        this.res.setHeader("Cache-Control", "no-cache");
        this.res.setHeader("Connection", "keep-alive");
    }

    /**
     * Send a delta event with content chunks
     */
    public delta(content: string): void {
        const lines = content
            .split("\n")
            .map((line) => `data: ${line}\n`)
            .join("");
        this.res.write(`event: ${SSE_EVENTS.DELTA}\n${lines}\n`);
    }

    /**
     * Send a conversation name event
     */
    public conversationName(name: string): void {
        this.res.write(
            `event: ${SSE_EVENTS.CONVERSATION_NAME}\ndata: ${name}\n\n`
        );
    }

    /**
     * Send a server error event
     */
    public serverError(errorMessage: string): void {
        this.res.write(
            `event: ${SSE_EVENTS.SERVER_ERROR}\ndata: ${errorMessage}\n\n`
        );
    }

    /**
     * End the SSE connection
     */
    public end(): void {
        this.res.end("data: [DONE]\n\n");
    }
}
