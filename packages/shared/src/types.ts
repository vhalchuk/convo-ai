import { MODELS, ROLES, SSE_EVENTS } from "./enums";

export type Model = (typeof MODELS)[keyof typeof MODELS];

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type Message = {
    role: (typeof ROLES)[keyof typeof ROLES];
    content: string;
    model?: string;
};

export type SSEEvent = (typeof SSE_EVENTS)[keyof typeof SSE_EVENTS];
