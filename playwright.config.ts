import { defineConfig, devices } from "@playwright/test";

const api = "http://127.0.0.1:4401";
const baseURL = "http://127.0.0.1:5173";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    channel:
      process.env.PLAYWRIGHT_CHANNEL || (process.platform === "win32" ? "msedge" : undefined),
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/fixtures/api.mjs 4401",
      url: api + "/health",
      reuseExistingServer: false,
    },
    {
      command: "pnpm dev",
      url: baseURL,
      timeout: 120000,
      reuseExistingServer: false,
      env: { VITE_FAKE_STORE_API_URL: api },
    },
  ],
});
