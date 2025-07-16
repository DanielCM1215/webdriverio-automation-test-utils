# automation-test-utils

A collection of JavaScript helper functions for [WebdriverIO](https://webdriver.io/) automation testing.

## API Interceptor

Intercepts browser-side API calls made using `fetch` or `XMLHttpRequest`. Captured JSON responses are stored in `sessionStorage`, allowing validation later during tests.

### Methods

- `setupInterception()` — Initializes interception for Fetch and XHR requests.
- `getStoredResponses()` — Retrieves all captured API responses.
- `waitForAPIResponse(endpoint, timeout)` — Waits for a specific API response to appear within a timeout window.
- `clearInterceptedResponses()` — Clears cached responses from `sessionStorage`.

### Usage Example

```js
import apiInterceptor from './apiInterceptor.js';

before(async () => {
  await apiInterceptor.setupInterception();
});

it('should intercept and validate API response', async () => {
  await browser.url('https://example.com');

  const response = await apiInterceptor.waitForAPIResponse('/api/user');
  expect(response.name).toBe('Daniel');
});
```

## NRIC Generator

Generates a random Malaysian NRIC number with a realistic birth date and 6-digit suffix. Useful for testing forms requiring valid-looking NRIC input.

### Usage Example

```js
const generateNRIC = require('./utils/nricGenerator');

const nric = generateNRIC();
console.log('Generated NRIC:', nric);
// Example output: 900512123456
```
