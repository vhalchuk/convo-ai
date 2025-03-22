import { type NextFunction, type Request, type Response } from "express";
import { BLAME_WHO } from "@/enums";
import { EnhancedError } from "@/lib/enhanced-error";
import { SSEEmitter } from "@/lib/sse-emitter";
import { SSEError } from "@/lib/sse-error";
import { ValidationError } from "@/lib/validate";
import { logger } from "@/services/logger";

export const requestErrorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof SSEError) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: err.message,
            blameWho: err.blameWho,
            originalError: err.originalError,
        });
        const sse = new SSEEmitter(res);
        sse.serverError(err.message);
        sse.end();
    } else if (err instanceof ValidationError) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: `Validation error: ${err.message}`,
            blameWho: BLAME_WHO.CLIENT,
        });
        res.status(400).json({
            error: "Validation failed",
            details: err.errors,
        });
    } else if (err instanceof EnhancedError) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: err.message,
            blameWho: err.blameWho,
            originalError: err.originalError,
        });
        res.status(500).json({ error: "Internal Server Error" });
    } else {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: `Server error: ${err}`,
            blameWho: BLAME_WHO.SERVER,
            originalError: err,
        });
        res.status(500).json({ error: "Internal Server Error" });
    }
};
