import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
    if (specifier.endsWith(".md")) {
        const url = new URL(specifier, context.parentURL).href;
        return {
            url,
            shortCircuit: true,
        };
    }
    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    if (url.endsWith(".md")) {
        const path = fileURLToPath(url);
        return {
            format: "module",
            source: `export default ${JSON.stringify(path)};`,
            shortCircuit: true,
        };
    }
    return nextLoad(url, context);
}
