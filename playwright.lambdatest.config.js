const { defineConfig } = require('@playwright/test');

const buildName = process.env.LT_BUILD_NAME || 'Amazon Device Parallel Tests';

function getCapabilities(testName) {
  return {
    browserName: 'Chrome',
    browserVersion: 'latest',
    'LT:Options': {
      platform: 'Windows 11',
      build: buildName,
      name: testName,
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      network: true,
      video: true,
      console: true,
      tunnel: false
    }
  };
}

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 120_000,
  reporter: [['list']],
  use: {
    baseURL: 'https://www.amazon.com',
    browserName: 'chromium',
    connectOptions: {
      wsEndpoint:
        `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
          JSON.stringify(getCapabilities('Amazon device test'))
        )}`
    },
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 25_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure'
  }
});
