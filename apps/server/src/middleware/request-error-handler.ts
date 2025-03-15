import { ErrorRequestHandler } from "express";
import { ValidationError } from "@/utils/validate";
import { logger } from "@/services/logger";

export const requestErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ValidationError) {
        logger.log({
            message: `Validation error: ${err.message}`,
            severity: logger.SEVERITIES.Warn
        });
        res.status(400).json({ error: "Validation failed", details: err.errors });
    } else {
        logger.log({
            message: `Server error: ${err}`,
            severity: logger.SEVERITIES.Warn
        });
        res.status(500).json({ error: "Internal Server Error" });
    }
};