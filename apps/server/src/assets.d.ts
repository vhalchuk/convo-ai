declare module "*.md" {
    /**
     * If you’re using the “text” loader, this will be the Markdown
     * as a string.
     *
     * If you’re using the “file” loader, this will be the
     * emitted file path (string) in your dist folder.
     */
    const value: string;
    export default value;
}
