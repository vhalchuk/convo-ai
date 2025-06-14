import express from "express";
import { tryCatch } from "@convo-ai/shared";
import { type Env, envSchema, setEnv } from "@/env";
import { corsMiddleware } from "@/middleware/cors";
import { requestErrorHandler } from "@/middleware/request-error-handler";
import router from "@/router";
import { initializeServices } from "@/services";
import { logger } from "@/services/logger";

type Context = {
    env: Env;
};

export const makeApp = async (ctx: Context) => {
    const env = envSchema.parse(ctx.env);
    setEnv(env);

    const initResult = await tryCatch(initializeServices);
    if (initResult.isErr()) {
        logger.log({
            severity: logger.SEVERITIES.Fatal,
            originalError: initResult.error,
            message:
                "Application failed to start due to service initialization failure",
        });
        process.exit(1);
    }

    const app = express();

    app.use(corsMiddleware(env.ALLOWED_ORIGIN));
    app.use(express.json());
    app.use("/api", router);
    app.use(requestErrorHandler);

    return app;
};
