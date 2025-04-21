import path from "node:path";
import { fileURLToPath } from "node:url";

export function resolveRelative(importMetaUrl: string, relativePath: string) {
    const __filename = fileURLToPath(importMetaUrl);
    const __dirname = path.dirname(__filename);
    return path.resolve(__dirname, relativePath);
}
