import { ErrorRequestHandler } from "express";
import { ValidationError } from "@/utils/validate";

export const requestErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ValidationError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
    } else {
        res.status(500).json({ error: "Internal Server Error" });
    }
};