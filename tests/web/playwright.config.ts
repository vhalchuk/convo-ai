import { defineConfig, devices } from "@playwright/test";
import { env } from "./env";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./.",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: env.CI,
    /* Retry on CI only */
    retries: env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: "html",
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: env.BASE_URL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",

        /* Timeouts */
        actionTimeout: 3000, // 3 seconds for actions like click, fill, etc.
        navigationTimeout: 3000, // 3 seconds for navigation
    },

    /* Configure projects for major browsers */
    projects: env.CI
        ? [
              /*
               * In CI, we only run tests in Chromium to:
               * 1. Reduce CI time significantly (less browser installation and execution time)
               * 2. Minimize resource usage on CI runners
               * 3. Get quick feedback on basic functionality failures
               *
               * During local development, we test across all major browsers to catch
               * cross-browser compatibility issues early.
               */
              {
                  name: "chromium",
                  use: { ...devices["Desktop Chrome"] },
              },
          ]
        : [
              {
                  name: "chromium",
                  use: { ...devices["Desktop Chrome"] },
              },

              {
                  name: "firefox",
                  use: { ...devices["Desktop Firefox"] },
              },

              {
                  name: "webkit",
                  use: { ...devices["Desktop Safari"] },
              },

              /* Test against mobile viewports. */
              // {
              //   name: 'Mobile Chrome',
              //   use: { ...devices['Pixel 5'] },
              // },
              // {
              //   name: 'Mobile Safari',
              //   use: { ...devices['iPhone 12'] },
              // },

              /* Test against branded browsers. */
              // {
              //   name: 'Microsoft Edge',
              //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
              // },
              // {
              //   name: 'Google Chrome',
              //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
              // },
          ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
