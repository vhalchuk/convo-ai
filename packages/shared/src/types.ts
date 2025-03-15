import { MODELS, ROLES } from "./enums";

export type Model = (typeof MODELS)[keyof typeof MODELS];

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type Message = {
    role: Role;
    content: string;
};
