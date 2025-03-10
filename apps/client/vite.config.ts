import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Load environment variables based on the current mode.
    const env = loadEnv(mode, process.cwd(), "");
    const isAnalyze = env.ANALYZE === "true";

    return {
        plugins: [
            react({
                babel: {
                    plugins: [
                        ["babel-plugin-react-compiler", { target: "19" }],
                    ],
                },
            }),
            tailwindcss(),
            ...(isAnalyze ? [visualizer({ open: true })] : []),
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                "@convo-ai/shared": path.resolve(
                    __dirname,
                    "../../packages/shared/src/index.ts"
                ),
            },
        },
        server: {
            host: "0.0.0.0",
            port: 5173,
        },
    };
});
