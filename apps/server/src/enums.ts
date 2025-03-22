export const BLAME_WHO = {
    CLIENT: "CLIENT", // bad input, missing params, etc.
    SERVER: "SERVER", // internal bug, unhandled case
    PACKAGE: "PACKAGE", // e.g., package throws or misbehaves
    SERVICE: "SERVICE", // e.g., DB/API/service unavailable
    UNKNOWN: "UNKNOWN",
} as const;
export type BlameWho = (typeof BLAME_WHO)[keyof typeof BLAME_WHO];
