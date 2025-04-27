import { expect, test } from "@playwright/test";
import { waitForAssistantToStopStreaming } from "./utils";

test("copy button copies message content", async ({ page }) => {
    // Grant clipboard permissions if supported
    const browserName = page.context().browser()?.browserType().name();

    if (browserName === "chromium") {
        await page
            .context()
            .grantPermissions(["clipboard-read", "clipboard-write"]);
    } else if (browserName === "webkit") {
        // WebKit doesn't support 'clipboard-write'; only grant 'clipboard-read'
        await page.context().grantPermissions(["clipboard-read"]);
    }

    await page.goto("/");
    await page.waitForSelector('[data-testid="message-input"]');

    const testMessage = "Hello, can you help me with a simple test?";
    await page.fill('[data-testid="message-input"]', testMessage);
    await page.press('[data-testid="message-input"]', "Enter");

    // Wait for assistant to finish streaming
    const messageContent = await waitForAssistantToStopStreaming(page);
    expect(messageContent).toBeTruthy();

    const copyButton = page.locator('[aria-label="Copy message"]');
    await expect(copyButton).toBeVisible();

    await copyButton.click();

    // Wait a bit for the clipboard to be updated
    await page.waitForTimeout(1000);

    // Only verify clipboard content if permissions were granted
    const copiedText = await page.evaluate(() => {
        return navigator.clipboard.readText();
    });
    expect(copiedText).toBe(messageContent);
});
