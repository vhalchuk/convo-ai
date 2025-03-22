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
        Object.setPrototypeOf(this, new.target.prototype); // Ensures instanceof works correctly

        this.name = this.constructor.name;
        this.blameWho = blameWho;
        this.originalError = originalError;

        Error.captureStackTrace(this, this.constructor);
    }
}
