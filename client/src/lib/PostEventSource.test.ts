import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import invariant from "@/lib/invariant.ts";
import { PostEventSource } from "./PostEventSource";

// Polyfill TextDecoderStream if not available (Node environment)
if (typeof global.TextDecoderStream === "undefined") {
    // @ts-expect-error It's okay for mock not to conform to the original type
    global.TextDecoderStream = class {
        readable: ReadableStream;
        writable: WritableStream;
        constructor() {
            const decoder = new TextDecoder();
            const ts = new TransformStream({
                transform(chunk, controller) {
                    controller.enqueue(decoder.decode(chunk, { stream: true }));
                },
                flush(controller) {
                    controller.enqueue(decoder.decode());
                },
            });
            this.readable = ts.readable;
            this.writable = ts.writable;
        }
    };
}

describe("PostEventSource", () => {
    let originalFetch: typeof fetch;
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        originalFetch = global.fetch;
        mockFetch = vi.fn();
        global.fetch = mockFetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it("dispatches open and message events when the stream emits an event", async () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode("data: Hello\n\n"));
                controller.close();
            },
        });

        mockFetch.mockResolvedValueOnce({
            body: stream,
        });

        const pes = new PostEventSource("http://example.com");

        const openEvent = await new Promise<Event>((resolve) =>
            pes.addEventListener("open", resolve)
        );
        expect(openEvent).toBeDefined();

        const messageEvent = await new Promise<MessageEvent>((resolve) =>
            pes.addEventListener("message", (event) => {
                invariant(
                    event instanceof MessageEvent,
                    "Event must be a MessageEvent"
                );
                resolve(event);
            })
        );
        expect(messageEvent).toBeDefined();
        expect(messageEvent.data).toBe("Hello");

        await new Promise((r) => setTimeout(r, 0));
        expect(pes.readyState).toBe(PostEventSource.CLOSED);
    });

    it("dispatches an error event when fetch returns no body", async () => {
        mockFetch.mockResolvedValueOnce({
            body: null,
        });

        const pes = new PostEventSource("http://example.com");

        const errorEvent = await new Promise<Event>((resolve) =>
            pes.addEventListener("error", resolve)
        );
        expect(errorEvent).toBeDefined();
        expect(pes.readyState).toBe(PostEventSource.CLOSED);
    });

    it("sets readyState to CLOSED when close() is called", async () => {
        const neverEndingStream = new ReadableStream({
            start() {
                // never-ending stream
            },
        });

        mockFetch.mockResolvedValueOnce({
            body: neverEndingStream,
        });

        const pes = new PostEventSource("http://example.com");
        await new Promise((r) => setTimeout(r, 0));

        pes.close();
        expect(pes.readyState).toBe(PostEventSource.CLOSED);
    });
});
