import { describe, expect, it } from "vitest";
import { ROLES } from "@/constants.ts";
import { upsertAssistantResponseMessage } from "@/lib/upsertAssistantResponseMessage.ts";
import { Message } from "@/types.ts";

describe("upsertAssistantResponseMessage", () => {
    it("inserts a message at the end of the messages array", () => {
        const initialMessages: Message[] = [
            {
                role: ROLES.USER,
                content: "Hello",
            },
        ];

        const result = upsertAssistantResponseMessage(initialMessages, "Hello");

        expect(result).not.toBe(initialMessages); // must be a new array reference
        expect(result).toEqual([
            {
                role: ROLES.USER,
                content: "Hello",
            },
            {
                role: ROLES.ASSISTANT,
                content: "Hello",
            },
        ]);
    });

    it("replaces the last assistant message if it exists", () => {
        const initialMessages: Message[] = [
            {
                role: ROLES.USER,
                content: "Hello",
            },
            {
                role: ROLES.ASSISTANT,
                content: "Hel",
            },
        ];
        const result = upsertAssistantResponseMessage(initialMessages, "lo");

        expect(result).not.toBe(initialMessages); // must be a new array reference
        expect(result).toEqual([
            {
                role: ROLES.USER,
                content: "Hello",
            },
            {
                role: ROLES.ASSISTANT,
                content: "Hello",
            },
        ]);
    });
});
