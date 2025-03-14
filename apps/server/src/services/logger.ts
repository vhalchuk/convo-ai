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

    public log(params: LoggerParams) {
        const { severity, message } = params;

        switch (severity) {
            case LOG_SEVERITIES.Error:
            case LOG_SEVERITIES.Fatal:
                console.error(message);
                break;
            case LOG_SEVERITIES.Warn:
                console.warn(message);
                break;
            default:
                console.log(message);
        }
    }
}

export const logger = new Logger();