import { BlameWho } from "@/enums";
import { Service } from "@/services/service-interface";

const LOG_SEVERITIES = {
    Error: "error",
    Fatal: "fatal",
    Warn: "warn",
    Info: "info",
    Debug: "debug",
} as const;
export type LogSeverity = (typeof LOG_SEVERITIES)[keyof typeof LOG_SEVERITIES];

type LoggerParams =
    | {
          severity:
              | typeof LOG_SEVERITIES.Debug
              | typeof LOG_SEVERITIES.Info
              | typeof LOG_SEVERITIES.Warn;
          message: string;
      }
    | {
          severity: typeof LOG_SEVERITIES.Error | typeof LOG_SEVERITIES.Fatal;
          message: string;
          blameWho?: BlameWho;
          originalError?: unknown;
      };

class Logger implements Service {
    name = "LoggerService";

    public SEVERITIES = LOG_SEVERITIES;

    private logLevel: LogSeverity =
        process.env.NODE_ENV === "production"
            ? LOG_SEVERITIES.Info
            : LOG_SEVERITIES.Debug;

    private shouldLog(severity: LogSeverity): boolean {
        const levels = Object.values(LOG_SEVERITIES);
        return levels.indexOf(severity) <= levels.indexOf(this.logLevel);
    }

    private formatMessage(severity: LogSeverity, data: unknown): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${severity.toUpperCase()}] ${JSON.stringify(data, null, 2)}`;
    }

    public log(params: LoggerParams) {
        const { severity, ...rest } = params;

        if (!this.shouldLog(severity)) {
            return;
        }

        const formattedMessage = this.formatMessage(severity, rest);

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
