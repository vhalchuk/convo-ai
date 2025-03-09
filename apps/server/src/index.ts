import express from "express";
import router from "@/router";
import { requestErrorHandler } from "@/middleware/request-error-handler";
import { corsMiddleware } from "@/middleware/cors";
import { addGracefulShutdownListeners } from "@/graceful-shutdown";
import { initializeServices } from "@/services";
import { logger } from "@/services/logger";

const main = async () => {
    try {
        await initializeServices();
    } catch (error) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: `Application failed to start due to service initialization failure: ${error}`
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
            message: `Server listening on port ${port}`
        });
    });

    addGracefulShutdownListeners(server);
}

void main();