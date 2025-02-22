import { describe, expect, it } from "vitest";
import { upsertAssistantResponseMessage } from "@/lib/upsertAssistantResponseMessage.ts";
import { Message } from "@/types.ts";

describe("upsertAssistantResponseMessage", () => {
    it("inserts a message at the end of the messages array", () => {
        const initialMessages: Message[] = [
            {
                role: "user",
                content: "Hello",
            },
        ];
        const responseMessage: Message = {
            role: "assistant",
            content: "Hello",
        };

        const result = upsertAssistantResponseMessage(
            initialMessages,
            responseMessage
        );

        expect(result).not.toBe(initialMessages); // must be a new array reference
        expect(result).toEqual([
            {
                role: "user",
                content: "Hello",
            },
            {
                role: "assistant",
                content: "Hello",
            },
        ]);
    });

    it("replaces the last assistant message if it exists", () => {
        const initialMessages: Message[] = [
            {
                role: "user",
                content: "Hello",
            },
            {
                role: "assistant",
                content: "Hel",
            },
        ];
        const responseMessage: Message = {
            role: "assistant",
            content: "Hello",
        };

        const result = upsertAssistantResponseMessage(
            initialMessages,
            responseMessage
        );

        expect(result).not.toBe(initialMessages); // must be a new array reference
        expect(result).toEqual([
            {
                role: "user",
                content: "Hello",
            },
            {
                role: "assistant",
                content: "Hello",
            },
        ]);
    });
});
