# 🚀 Amazon Device Parallel Tests (Playwright)

This project demonstrates automated end-to-end testing of Amazon using **Playwright (JavaScript)** with **parallel execution**.

It covers searching for devices, adding them to the cart, extracting prices, and running tests simultaneously.

---

## 📌 Features

* 🔍 Search for products (iPhone & Galaxy devices)
* 🛒 Add available products to cart
* 💰 Extract and print device price
* ⚡ Run tests in parallel using Playwright workers
* ☁️ Execute tests on LambdaTest Cloud
* 🧪 Robust handling for dynamic UI elements

---

## 🧪 Test Scenarios

1. Search for **iPhone** → Add first available product → Print price
2. Search for **Galaxy device** → Add first available product → Print price
3. Execute both scenarios **in parallel**

---

## 📁 Project Structure

```
.
├── tests/
│   └── amazon.spec.js
├── playwright.config.js
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have:

* Node.js (v18 or higher)
* npm (comes with Node.js)

---

## 📦 Clone the Repository

```bash
git clone https://github.com/UttamYadav-DGI/-TestMu-AI-Assignment.git
cd -TestMu-AI-Assignment
```

---

## 📥 Install Dependencies

```bash
npm install
npx playwright install chromium
```

---

## ▶️ Run Tests

### 🔹 Run in Parallel (Default)

```bash
npm test
```

### 🔹 Run in Headed Mode

```bash
npm run test:headed
```

### 🔹 Debug Mode

```bash
npm run test:debug
```

---

## ⚙️ Playwright Configuration

Parallel execution is enabled in `playwright.config.js`:

```js
fullyParallel: true,
workers: 2
```

---

## ☁️ Run on LambdaTest Cloud

### 1️⃣ Create an Account

Sign up on LambdaTest and get your credentials.

---

### 2️⃣ Set Environment Variables

```bash
export LT_USERNAME="your_lambdatest_username"
export LT_ACCESS_KEY="your_lambdatest_access_key"
```

---

### 3️⃣ Run Tests on Cloud

```bash
npm run test:lambdatest
```

---

## 📊 Output

* Device prices are printed in the console
* Test results are displayed in Playwright report

To view report:

```bash
npx playwright show-report
```

---

## ⚠️ Notes

Amazon may show:

* CAPTCHA challenges
* Regional popups
* Product unavailability
* Anti-bot checks

👉 These may interrupt automation and require manual intervention.

---

## 🛠️ Improvements (Future Scope)

* Add retry logic for flaky tests
* Implement better selectors for stability
* Add GitHub Actions (CI/CD pipeline)
* Record videos/screenshots for test runs
* Cross-browser testing (Firefox, WebKit)

---

## 👨‍💻 Author

**Uttam Yadav**
💡 Full-Stack Developer | Automation Enthusiast

---

## ⭐ Contribution

If you'd like to improve this project:

1. Fork the repo
2. Create a new branch
3. Make changes
4. Submit a pull request

---

## 📜 License

This project is for educational and assignment purposes.
