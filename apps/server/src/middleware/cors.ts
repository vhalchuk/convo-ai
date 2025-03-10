import cors from "cors";
import { env } from "@/env";

export const corsMiddleware = cors({
    origin: env.ALLOWED_ORIGIN,
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
});