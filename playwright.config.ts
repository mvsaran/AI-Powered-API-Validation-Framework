import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
    }]
  ],
  use: {
    // API testing configuration
    baseURL: process.env.BASE_URL || 'https://api.mock-pharmacy.example',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    // We do not need a browser for API-only testing
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  expect: {
    timeout: 5000,
  },
  timeout: 60000, // 60s max per test including LLM reasoning
});
