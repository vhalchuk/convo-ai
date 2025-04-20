import { makeApp } from "@convo-ai/server";

export default makeApp({
    env: {
        ENV: "production",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ALLOWED_ORIGIN: `https://${process.env.VERCEL_URL}`,
    },
});
