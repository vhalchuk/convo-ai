import fs from "fs/promises";
import Handlebars from "handlebars";

export async function renderPrompt(
    templatePath: string,
    context?: Record<string, unknown>
): Promise<string> {
    const raw = await fs.readFile(templatePath, "utf-8");
    const template = Handlebars.compile(raw);
    return template(context);
}
