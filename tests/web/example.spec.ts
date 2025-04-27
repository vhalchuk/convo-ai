import { expect, test } from "@playwright/test";
import { env } from "./env";

test("environment is configured correctly", async () => {
    expect(env.BASE_URL).toBeTruthy();
});

test("homepage loads", async ({ page }) => {
    // Uses the baseURL from the env config
    await page.goto("/");

    // Basic check that the page loads
    await expect(page).toHaveTitle("Convo AI");
});

test("can send message to AI assistant and receive response", async ({
    page,
}) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for the app to fully load
    await page.waitForSelector('[data-testid="message-input"]');

    // Type a test message
    const testMessage = "Hello, can you help me with a simple test?";
    await page.fill('[data-testid="message-input"]', testMessage);

    // Send the message (by pressing Enter)
    await page.press('[data-testid="message-input"]', "Enter");

    // Wait for the user message to appear in the conversation
    await page.waitForSelector('[data-testid="user-message"]');
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toContainText(testMessage);

    // Wait for any response from the assistant to appear
    await page.waitForSelector('[data-testid="assistant-message-content"]', {
        timeout: 2_000,
    });

    // Verify that the assistant response contains some text
    const assistantResponse = page
        .locator('[data-testid="assistant-message-content"]')
        .first();
    await expect(assistantResponse).toBeVisible();

    // Ensure the response has actual content
    const responseText = await assistantResponse.textContent();
    expect(responseText).toBeTruthy();
    expect(responseText?.length).toBeGreaterThan(5);
});
