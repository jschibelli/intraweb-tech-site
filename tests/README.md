# Playwright E2E Testing

This directory contains end-to-end (E2E) tests for the IntraWeb Technologies landing page using Playwright.

## Overview

Playwright is a powerful testing framework that allows us to test our application across multiple browsers (Chromium, Firefox, WebKit) and devices. These tests simulate real user interactions to ensure the site works correctly.

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Open Playwright UI (interactive mode)
```bash
npm run test:e2e:ui
```
This opens an interactive UI where you can:
- See tests running in real-time
- Debug failing tests
- Inspect DOM elements
- Step through test execution

### Run tests with visible browser
```bash
npm run test:e2e:headed
```

### Run tests only in Chromium
```bash
npm run test:e2e:chromium
```

### View test report
```bash
npm run test:e2e:report
```

## Test Structure

```
tests/
└── e2e/
    ├── homepage.spec.ts      # Homepage tests
    ├── about.spec.ts         # About page tests
    └── careers.spec.ts       # Careers page tests
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Interact with elements
    await page.click('button');
    
    // Make assertions
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Best Practices

1. **Use describe blocks** to group related tests
2. **Use meaningful test names** that describe what is being tested
3. **Test user journeys** not implementation details
4. **Keep tests independent** - each test should work standalone
5. **Use page.locator()** for better reliability over CSS selectors
6. **Wait for elements** using Playwright's auto-waiting features
7. **Test across viewports** for responsive design

### Common Patterns

#### Navigation
```typescript
await page.goto('/about');
await page.getByRole('link', { name: /about/i }).click();
```

#### Finding Elements
```typescript
// By role (preferred)
await page.getByRole('button', { name: 'Submit' });

// By text
await page.getByText('Hello World');

// By test ID
await page.getByTestId('submit-button');

// By selector
await page.locator('button.primary');
```

#### Assertions
```typescript
await expect(page).toHaveTitle(/IntraWeb/);
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('button')).toHaveText('Click me');
await expect(page).toHaveURL(/\/about/);
```

#### Responsive Testing
```typescript
await page.setViewportSize({ width: 375, height: 667 });
```

## Test Configuration

Configuration is in `playwright.config.ts` at the project root. Key settings:

- **Base URL**: http://localhost:3000
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Web Server**: Automatically starts dev server before tests

## Debugging Tests

### Using Playwright UI
```bash
npm run test:e2e:ui
```

### Using Browser Developer Tools
```bash
npm run test:e2e:headed
```

### Playwright Inspector
```bash
npx playwright test --debug
```

### View trace files
If a test fails, a trace file is generated. View it:
```bash
npx playwright show-trace test-results/.../trace.zip
```

## CI/CD Integration

Tests are configured to run in CI environments:
- Stricter timeouts
- More retries (2)
- No parallel execution
- Reports saved as artifacts

## Troubleshooting

### Tests timing out
- Increase timeout in test or config
- Check if dev server is running
- Verify network conditions

### Flaky tests
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use more specific selectors
- Increase retries in CI

### Element not found
- Use Playwright's auto-waiting
- Check if element is in viewport
- Verify selector is correct

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
