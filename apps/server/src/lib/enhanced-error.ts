import type { BlameWho } from "@/enums";

export type EnhancedErrorParams = {
    message: string;
    blameWho: BlameWho;
    originalError?: unknown;
};

export class EnhancedError extends Error {
    blameWho: BlameWho;
    originalError?: unknown;

    constructor(params: EnhancedErrorParams) {
        const { message, blameWho, originalError } = params;

        super(message);

        this.name = this.constructor.name;
        this.blameWho = blameWho;
        this.originalError = originalError;
    }
}
