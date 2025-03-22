export const MODELS = {
    GPT4oMini: "gpt-4o-mini",
    GPT4o: "gpt-4o",
} as const;
export const models = [MODELS.GPT4oMini, MODELS.GPT4o] as const;

export const ROLES = {
    SYSTEM: "system",
    DEVELOPER: "developer",
    ASSISTANT: "assistant",
    USER: "user",
} as const;

export const SSE_EVENTS = {
    OPEN: "open",
    ERROR: "error",
    MESSAGE: "message",
    DELTA: "delta",
    CONVERSATION_NAME: "conversation_name",
    SERVER_ERROR: "server_error",
} as const;
