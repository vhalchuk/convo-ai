import cors from "cors";

export const corsMiddleware = (origin: string) =>
    cors({
        origin,
        methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type"],
    });
