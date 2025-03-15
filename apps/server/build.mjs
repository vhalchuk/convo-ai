import esbuild from "esbuild";

(async () => {
    const start = Date.now();

    const result = await esbuild.build({
        entryPoints: ["./src/index.ts"],
        bundle: true,
        metafile: true,
        logLevel: "info",
        packages: "external",
        sourcemap: true,
        platform: "node",
        target: "esnext",
        format: "esm",
        outfile: "dist/index.mjs",
    });

    const end = Date.now();
    console.log(`✅ Build completed in ${end - start}ms`);

    console.log("📊 Bundle Output Stats:");
    console.log(
        await esbuild.analyzeMetafile(result.metafile, { color: true })
    );
})();
