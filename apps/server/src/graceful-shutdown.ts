import type { Server } from "node:http";
import { tryCatch } from "@convo-ai/shared";
import { cleanupServices } from "@/services";
import { logger } from "@/services/logger";

type GracefulShutdown = (reason: string | Error) => Promise<void>;

const makeGracefulShutdown =
    (server: Server): GracefulShutdown =>
    async (reason) => {
        logger.log({
            severity: logger.SEVERITIES.Fatal,
            message:
                reason instanceof Error
                    ? `Server shutting down: ${reason.message}, stack trace: ${reason.stack}`
                    : `Server shutting down: ${reason}`,
        });

        const cleanupResult = await tryCatch(cleanupServices);
        if (cleanupResult.isErr()) {
            logger.log({
                severity: logger.SEVERITIES.Error,
                message: `Error during cleanup: ${String(cleanupResult.error)}`,
            });
            process.exit(1);
        }

        server.close((err) => {
            if (err) {
                logger.log({
                    severity: logger.SEVERITIES.Error,
                    message: `Error during server close: ${err.message}`,
                });
                process.exit(1);
                return;
            }
            logger.log({
                severity: logger.SEVERITIES.Info,
                message: `Server has been successfully shut-down`,
            });
            process.exit();
        });

        setTimeout(() => {
            logger.log({
                severity: logger.SEVERITIES.Error,
                message:
                    "Server close timed out after 10 seconds, forcing exit",
            });
            process.exit(1);
        }, 10_000);
    };

const makeSignalShutdown =
    (gracefulShutdown: GracefulShutdown) => (signal: string) => () =>
        gracefulShutdown(`Received ${signal} signal, shutting down...`);

export const addGracefulShutdownListeners = (server: Server) => {
    const gracefulShutdown = makeGracefulShutdown(server);
    const signalShutdown = makeSignalShutdown(gracefulShutdown);

    process.on("SIGTERM", signalShutdown("SIGTERM"));
    process.on("SIGINT", signalShutdown("SIGINT"));
    process.on("SIGHUP", signalShutdown("SIGHUP"));
    process.on("uncaughtException", gracefulShutdown);
    process.on("unhandledRejection", gracefulShutdown);
};
