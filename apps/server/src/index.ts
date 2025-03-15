import express from "express";
import { tryCatch } from "@convo-ai/shared";
import { addGracefulShutdownListeners } from "@/graceful-shutdown";
import { corsMiddleware } from "@/middleware/cors";
import { requestErrorHandler } from "@/middleware/request-error-handler";
import router from "@/router";
import { initializeServices } from "@/services";
import { logger } from "@/services/logger";

const main = async () => {
    const initResult = await tryCatch(initializeServices);
    if (initResult.isErr()) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: `Application failed to start due to service initialization failure: ${initResult.error}`,
        });
        process.exit(1);
    }

    const port = 8000;
    const app = express();

    app.use(corsMiddleware);
    app.use(express.json());
    app.use(router);
    app.use(requestErrorHandler);

    const server = app.listen(port, () => {
        logger.log({
            severity: logger.SEVERITIES.Info,
            message: `Server listening on port ${port}`,
        });
    });

    addGracefulShutdownListeners(server);
};

void main();
