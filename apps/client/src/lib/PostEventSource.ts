import { merge } from "lodash-es";
import { type SSEEvent, SSE_EVENTS, sseEventsSchema } from "@convo-ai/shared";

type PostEventSourceOptions = {
    headers?: HeadersInit;
    body?: BodyInit | null;
};

type ParsedEvent = {
    data: string;
    event: SSEEvent;
    id: string | null;
    retry: number | null;
};

export class PostEventSource extends EventTarget {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSED = 2;

    public readyState = PostEventSource.CONNECTING;
    public onopen: ((evt: Event) => void) | null = null;
    public onmessage: ((evt: MessageEvent) => void) | null = null;
    public onerror: ((evt: Event) => void) | null = null;

    private url: string;
    private options: PostEventSourceOptions;
    private abortController = new AbortController();

    constructor(url: string, options: PostEventSourceOptions = {}) {
        super();

        this.url = url;
        this.options = options;

        void this.start();
    }

    private async start(): Promise<void> {
        try {
            const response = await fetch(this.url, {
                method: "POST",
                headers: merge(
                    {
                        Accept: "text/event-stream",
                    },
                    this.options.headers
                ),
                body: this.options.body,
                signal: this.abortController.signal,
            });
            if (!response.body) throw new Error("No response body");

            this.readyState = PostEventSource.OPEN;
            const openEvent = new Event("open");
            this.dispatchEvent(openEvent);
            this.onopen?.(openEvent);

            const reader = response.body
                .pipeThrough(new TextDecoderStream())
                .getReader();

            let buffer = "";
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += value;
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop() ?? "";

                let parsedEvent: ParsedEvent = {
                    data: "",
                    event: SSE_EVENTS.MESSAGE,
                    id: null,
                    retry: null,
                };

                for (const line of lines) {
                    if (line === "") {
                        if (parsedEvent.data) {
                            parsedEvent.data = parsedEvent.data.replace(
                                /\n$/,
                                ""
                            );
                            const messageEvent = new MessageEvent(
                                parsedEvent.event,
                                {
                                    data: parsedEvent.data,
                                    lastEventId: parsedEvent.id ?? "",
                                }
                            );
                            this.dispatchEvent(messageEvent);
                            if (parsedEvent.event === "message") {
                                this.onmessage?.(messageEvent);
                            }
                        }
                        parsedEvent = {
                            data: "",
                            event: SSE_EVENTS.MESSAGE,
                            id: null,
                            retry: null,
                        };
                    } else if (line.startsWith(":")) {
                        // comment line, ignore
                    } else {
                        const colonIndex = line.indexOf(":");
                        let field: string, valueStr: string;
                        if (colonIndex !== -1) {
                            field = line.slice(0, colonIndex);
                            valueStr = line.slice(colonIndex + 1);
                            if (valueStr.startsWith(" ")) {
                                valueStr = valueStr.slice(1);
                            }
                        } else {
                            field = line;
                            valueStr = "";
                        }
                        switch (field) {
                            case "data":
                                parsedEvent.data += valueStr + "\n";
                                break;
                            case "event":
                                parsedEvent.event =
                                    sseEventsSchema.parse(valueStr);
                                break;
                            case "id":
                                parsedEvent.id = valueStr;
                                break;
                            case "retry":
                                parsedEvent.retry = parseInt(valueStr, 10);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error && error.name === "AbortError") {
                return; // Ignore the abort error
            }

            this.readyState = PostEventSource.CLOSED;
            const errorEvent = new MessageEvent(SSE_EVENTS.ERROR, {
                data: String(error),
            });
            this.dispatchEvent(errorEvent);
            this.onerror?.(errorEvent);
        }
        this.readyState = PostEventSource.CLOSED;
    }

    // @ts-expect-error The override is typed correctly
    override addEventListener(
        type: SSEEvent,
        listener: (evt: MessageEvent<string>) => void,
        options?: boolean | AddEventListenerOptions
    ): void {
        // @ts-expect-error Works well
        super.addEventListener(type, listener, options);
    }

    public close(): void {
        this.abortController.abort();
        this.readyState = PostEventSource.CLOSED;
    }
}
