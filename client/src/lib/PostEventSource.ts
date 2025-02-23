interface PostEventSourceOptions {
    headers?: HeadersInit;
    body?: BodyInit | null;
}

export class PostEventSource extends EventTarget {
    static readonly CONNECTING: number = 0;
    static readonly OPEN: number = 1;
    static readonly CLOSED: number = 2;

    public readyState: number = PostEventSource.CONNECTING;
    public onopen: ((evt: Event) => void) | null = null;
    public onmessage: ((evt: MessageEvent) => void) | null = null;
    public onerror: ((evt: Event) => void) | null = null;

    private url: string;
    private options: PostEventSourceOptions;
    private _abortController: AbortController;

    constructor(url: string, options: PostEventSourceOptions = {}) {
        super();
        this.url = url;
        this.options = options;
        this._abortController = new AbortController();
        this._start();
    }

    private async _start(): Promise<void> {
        try {
            const response = await fetch(this.url, {
                method: "POST",
                headers: {
                    Accept: "text/event-stream",
                    ...this.options.headers,
                },
                body: this.options.body,
                signal: this._abortController.signal,
            });

            this.readyState = PostEventSource.OPEN;
            const openEvt = new Event("open");
            this.dispatchEvent(openEvt);
            if (this.onopen) this.onopen(openEvt);

            const reader: ReadableStreamDefaultReader<string> = response
                .body!.pipeThrough(new TextDecoderStream())
                .getReader();

            let buffer = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += value;
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop() || "";
                let event = {
                    data: "",
                    event: "message",
                    id: null as string | null,
                    retry: null as number | null,
                };
                for (const line of lines) {
                    if (line === "") {
                        if (event.data !== "") {
                            event.data = event.data.replace(/\n$/, "");
                            const msgEvt = new MessageEvent(event.event, {
                                data: event.data,
                                lastEventId: event.id || "",
                            });
                            this.dispatchEvent(msgEvt);
                            if (event.event === "message" && this.onmessage) {
                                this.onmessage(msgEvt);
                            }
                        }
                        event = {
                            data: "",
                            event: "message",
                            id: null,
                            retry: null,
                        };
                    } else if (line.startsWith(":")) {
                        // comment line, ignore
                    } else {
                        const colon = line.indexOf(":");
                        let field: string, val: string;
                        if (colon !== -1) {
                            field = line.slice(0, colon);
                            val = line.slice(colon + 1);
                            // Remove exactly one leading space if present (per SSE spec)
                            if (val.startsWith(" ")) {
                                val = val.slice(1);
                            }
                        } else {
                            field = line;
                            val = "";
                        }
                        if (field === "data") {
                            event.data += val + "\n";
                        } else if (field === "event") {
                            event.event = val;
                        } else if (field === "id") {
                            event.id = val;
                        } else if (field === "retry") {
                            event.retry = parseInt(val, 10);
                        }
                    }
                }
            }
        } catch (err) {
            this.readyState = PostEventSource.CLOSED;
            const errorEvt = new Event("error");
            this.dispatchEvent(errorEvt);
            if (this.onerror) this.onerror(errorEvt);
        }
        this.readyState = PostEventSource.CLOSED;
    }

    public close(): void {
        this._abortController.abort();
        this.readyState = PostEventSource.CLOSED;
    }
}
