import { ErrorRequestHandler } from "express";
import { BLAME_WHO } from "@/enums";
import { logger } from "@/services/logger";
import { EnhancedError } from "@/utils/enhanced-error";
import { SSEError } from "@/utils/sse-error";
import { ValidationError } from "@/utils/validate";

export const requestErrorHandler: ErrorRequestHandler = (
    err,
    _req,
    res,
    _next
) => {
    if (err instanceof SSEError) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: err.message,
            blameWho: err.blameWho,
            originalError: err.originalError,
        });
        res.end(
            `event: server_error\ndata: ${err.message}\n\ndata: [DONE]\n\n`
        );
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
