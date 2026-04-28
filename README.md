# Amazon Device Parallel Tests

This project uses Playwright with JavaScript to automate these scenarios:

- Search Amazon.com for an iPhone, add an available result to the cart, and print the device price.
- Search Amazon.com for a Galaxy device, add an available result to the cart, and print the device price.
- Run both scenarios in parallel.

## Prerequisites

- Node.js 18 or newer
- npm

## Install

```bash
npm install
npx playwright install chromium
```

## Run Locally

```bash
npm test
```

The Playwright config enables parallel execution with:

```js
fullyParallel: true,
workers: 2
```

Device prices are printed to the console during the test run.

For headed mode:

```bash
npm run test:headed
```

For debugging:

```bash
npm run test:debug
```

## LambdaTest Cloud

1. Create a LambdaTest account.
2. Get your `LT_USERNAME` and `LT_ACCESS_KEY` from the LambdaTest dashboard.
3. Export the credentials:

```bash
export LT_USERNAME="your_lambdatest_username"
export LT_ACCESS_KEY="your_lambdatest_access_key"
```

4. Run the cloud config:

```bash
npm run test:lambdatest
```

## Notes

Amazon may show CAPTCHA, regional prompts, unavailable listings, warranty popups, or anti-bot checks. The tests include common fallbacks, but any CAPTCHA must be resolved outside the automated test flow.

## GitHub Submission

Create a public GitHub repository and push this project:

```bash
git init
git add .
git commit -m "Add parallel Amazon Playwright tests"
git branch -M main
git remote add origin https://github.com/UttamYadav-DGI/-TestMu-AI-Assignment.git
git push -u origin main
```
