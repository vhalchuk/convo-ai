import { expect, test } from "@playwright/test";

test("displays model information for auto mode", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector('[data-testid="message-input"]');

    const testMessage = "What is the capital of France?";
    await page.fill('[data-testid="message-input"]', testMessage);

    await page.press('[data-testid="message-input"]', "Enter");

    await page.waitForSelector('[data-testid="assistant-message"]', {
        timeout: 2_000,
    });

    const modelInfo = page.locator('[data-testid="assistant-message"]').first();
    await expect(modelInfo).toContainText("Using model:");
});

test("displays model information for specific model", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector('[data-testid="message-input"]');

    await page.click('select[name="model"]');
    await page.selectOption('select[name="model"]', "gpt-4.1");

    const testMessage = "What is the capital of France?";
    await page.fill('[data-testid="message-input"]', testMessage);

    await page.press('[data-testid="message-input"]', "Enter");

    await page.waitForSelector('[data-testid="assistant-message"]', {
        timeout: 2_000,
    });

    const modelInfo = page.locator('[data-testid="assistant-message"]').first();
    await expect(modelInfo).toContainText("Using model: gpt-4.1");
});
