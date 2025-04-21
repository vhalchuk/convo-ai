export const BLAME_WHO = {
    CLIENT: "CLIENT", // bad input, missing params, etc.
    SERVER: "SERVER", // internal bug, unhandled case
    PACKAGE: "PACKAGE", // e.g., package throws or misbehaves
    SERVICE: "SERVICE", // e.g., DB/API/service unavailable
    UNKNOWN: "UNKNOWN",
} as const;
export type BlameWho = (typeof BLAME_WHO)[keyof typeof BLAME_WHO];

export const MODEL_TIERS = {
    DIRECT_LITE: "direct-lite",
    DIRECT_PRO: "direct-pro",
    REASON_LITE: "reason-lite",
    REASON_PRO: "reason-pro",
} as const;

export const TOKEN_IDS = {
    direct: 37135,
    reason: 42743,
    "-lite": 188964,
    "-pro": 9666,
};
