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
