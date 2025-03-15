import { Service } from "@/services/service-interface";

const LOG_SEVERITIES = {
    Error: "error",
    Fatal: "fatal",
    Warn: "warn",
    Info: "info",
    Debug: "debug",
} as const;
type LogSeverity = (typeof LOG_SEVERITIES)[keyof typeof LOG_SEVERITIES];

type LoggerParams = {
    severity: LogSeverity;
    message: string;
}

class Logger implements Service {
    name = "LoggerService";

    public SEVERITIES = LOG_SEVERITIES;

    private logLevel: LogSeverity = process.env.NODE_ENV === "production"
        ? LOG_SEVERITIES.Info
        : LOG_SEVERITIES.Debug;

    private shouldLog(severity: LogSeverity): boolean {
        const levels = Object.values(LOG_SEVERITIES);
        return levels.indexOf(severity) <= levels.indexOf(this.logLevel);
    }

    private formatMessage(severity: LogSeverity, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${severity.toUpperCase()}] ${message}`;
    }

    public log(params: LoggerParams) {
        const { severity, message } = params;

        if (!this.shouldLog(severity)) {
            return;
        }

        const formattedMessage = this.formatMessage(severity, message);

        switch (severity) {
            case LOG_SEVERITIES.Error:
            case LOG_SEVERITIES.Fatal:
                console.error(formattedMessage);
                break;
            case LOG_SEVERITIES.Warn:
                console.warn(formattedMessage);
                break;
            default:
                console.log(formattedMessage);
        }
    }
}

export const logger = new Logger();