// @ts-check
const { defineConfig, devices } = require('@playwright/test')

const WEB_URL = process.env.WEB_URL || 'http://localhost:8080'
const API_URL = process.env.API_BASE_URL || 'http://localhost:3000'

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: WEB_URL,
    extraHTTPHeaders: { 'x-test-source': 'playwright' },
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: process.env.CI
    ? undefined
    : undefined, // assume stack is already running locally (npm start)
  metadata: {
    apiUrl: API_URL
  }
})
