import { Page, expect } from "@playwright/test";

/**
 * Waits for the assistant to stop streaming a message by monitoring content changes
 * @param page Playwright page
 * @param thresholdMs Time in milliseconds to wait for no changes before considering streaming complete
 * @param startTimeoutMs Time in milliseconds to wait for assistant to start streaming
 * @returns The final message content
 * @throws Error if the message content cannot be found or if streaming doesn't start within timeout
 */
export async function waitForAssistantToStopStreaming(
    page: Page,
    thresholdMs = 1000,
    startTimeoutMs = 3000
): Promise<string> {
    const messageLocator = page
        .locator('[data-testid="assistant-message-content"]')
        .first();
    const POLL_INTERVAL_MS = 100;

    // Wait for initial content with timeout
    await expect(messageLocator).toContainText(/./, {
        timeout: startTimeoutMs,
    });

    let lastContent = await messageLocator.textContent();
    let lastChangeTime = Date.now();

    // Use a more structured polling approach
    while (Date.now() - lastChangeTime < thresholdMs) {
        await page.waitForTimeout(POLL_INTERVAL_MS);

        const currentContent = await messageLocator.textContent();

        if (currentContent !== lastContent) {
            lastContent = currentContent;
            lastChangeTime = Date.now();
        }
    }

    const finalContent = await messageLocator.textContent();
    return finalContent ?? "";
}
