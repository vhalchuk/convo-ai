import dotenv from "dotenv";
import { addGracefulShutdownListeners } from "@/graceful-shutdown";
import { logger } from "@/services/logger";
import { makeApp } from "./index";

dotenv.config();

const app = await makeApp({
    env: process.env as any,
});

const port = 8000;
const server = app.listen(port, () => {
    logger.log({
        severity: logger.SEVERITIES.Info,
        message: `Server listening on port ${port}`,
    });
});

addGracefulShutdownListeners(server);
