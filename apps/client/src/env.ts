import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    /**
     * The prefix that client-side variables must have. This is enforced both at
     * a type-level and at runtime.
     */
    clientPrefix: "CLIENT_",
    client: {
        CLIENT_API_DOMAIN: z.string().optional(),
    },
    runtimeEnv: import.meta.env,
    emptyStringAsUndefined: true,
});
