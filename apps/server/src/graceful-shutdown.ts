import { logger } from "@/services/logger";
import type { Server } from "node:http";
import { cleanupServices } from "@/services";

type GracefulShutdown = (reason: string | Error) => Promise<void>;

const makeGracefulShutdown = (server: Server): GracefulShutdown => async (reason) => {
    logger.log({
        severity: logger.SEVERITIES.Fatal,
        message: reason instanceof Error
            ? `Unhandled Rejection: ${reason.message}, stack trace: ${reason.stack}`
            : "Unhandled Rejection",
    });

    try {
        await cleanupServices();
        server.close(() => {
            logger.log({
                severity: logger.SEVERITIES.Info,
                message: `Server has been successfully shut-down`,
            });
            process.exit();
        })
    } catch (ex) {
        process.exit(1);
    }
};
const makeSignalShutdown = (gracefulShutdown: GracefulShutdown) => (signal: string) => () => gracefulShutdown(`Received ${signal} signal, shutting down...`);

export const addGracefulShutdownListeners = (server: Server) => {
    const gracefulShutdown = makeGracefulShutdown(server);
    const signalShutdown = makeSignalShutdown(gracefulShutdown);

    process.on("SIGTERM", signalShutdown("SIGTERM"));
    process.on("SIGINT", signalShutdown("SIGINT"));
    process.on("SIGHUP", signalShutdown("SIGHUP"));
    process.on("uncaughtException", gracefulShutdown);
    process.on("unhandledRejection", function (reason) {
        logger.log({
            severity: logger.SEVERITIES.Error,
            message: reason instanceof Error
                ? `Unhandled Rejection: ${reason.message}, stack trace: ${reason.stack}`
                : "Unhandled Rejection",
        });
    });
}