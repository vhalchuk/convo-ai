export const MODELS = {
    "gpt-4.1": "gpt-4.1",
    "gpt-4.1-mini": "gpt-4.1-mini",
    "gpt-4.1-nano": "gpt-4.1-nano",
    "o4-mini": "o4-mini",
    o3: "o3",
} as const;

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
