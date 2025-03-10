import type { ZodSchema, ZodError } from "zod";

export class ValidationError extends Error {
    public errors: ReturnType<ZodError["format"]>;

    constructor(error: ZodError) {
        super("Validation failed");
        this.name = "ValidationError";
        this.errors = error.format();
    }
}

export function validate<T>(schema: ZodSchema<T>, body: unknown): T {
    const result = schema.safeParse(body);

    if (!result.success) {
        throw new ValidationError(result.error);
    }

    return result.data;
}