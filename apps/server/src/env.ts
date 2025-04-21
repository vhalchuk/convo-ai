import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envSchema = z.object({
    ALLOWED_ORIGIN: z.string().url(),
    ENV: z.union([z.literal("development"), z.literal("production")]),
    OPENAI_API_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export const setEnv = (_env: Env) => {
    env = createEnv({
        server: {
            ALLOWED_ORIGIN: z.string().url(),
            ENV: z.union([z.literal("development"), z.literal("production")]),
            OPENAI_API_KEY: z.string().min(1),
        },
        runtimeEnv: _env,
        emptyStringAsUndefined: true,
    });
};

export const getEnv = () => {
    if (!env) throw new Error("env hasn't been initialized yet");

    return env;
};
