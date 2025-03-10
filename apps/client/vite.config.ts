import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";

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
            splitVendorChunkPlugin(),
            ...(isAnalyze ? [visualizer({ open: true })] : []),
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            host: "0.0.0.0",
            port: 5173,
        },
    };
});
