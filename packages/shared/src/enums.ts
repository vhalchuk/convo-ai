export const MODELS = {
    GPT4oMini: "gpt-4o-mini",
    GPT4o: "gpt-4o",
} as const;
export const models = [
    MODELS.GPT4oMini,
    MODELS.GPT4o
] as const;

export const ROLES = {
    SYSTEM: "system",
    DEVELOPER: "developer",
    ASSISTANT: "assistant",
    USER: "user",
} as const;
export const roles = [
    ROLES.SYSTEM,
    ROLES.DEVELOPER,
    ROLES.ASSISTANT,
    ROLES.USER,
] as const;
