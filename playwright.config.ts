import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4321/awesome-cheatsheets/",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // `--ignore-lock` keeps the server in the foreground: since Astro 7.4,
    // `astro preview` auto-backgrounds itself when it detects an AI agent,
    // and Playwright then sees the command exit early (issue #205).
    command: "npx astro preview --ignore-lock",
    url: "http://localhost:4321/awesome-cheatsheets",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});