import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test('should load successfully', async ({ page }) => {
        await page.goto('/');

        // Check page title
        await expect(page).toHaveTitle(/IntraWeb Technologies/i);

        // Verify page loaded
        await expect(page.locator('body')).toBeVisible();
    });

    test('should display hero section', async ({ page }) => {
        await page.goto('/');

        // Check for main heading - look for any h1
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();
    });

    test('should have working navigation', async ({ page }) => {
        await page.goto('/');

        // Check for navigation element
        const nav = page.locator('nav').first();
        await expect(nav).toBeVisible();

        // Check for common navigation links
        const aboutLink = page.getByRole('link', { name: /about/i });
        if (await aboutLink.count() > 0) {
            await expect(aboutLink.first()).toBeVisible();
        }
    });

    test('should have footer', async ({ page }) => {
        await page.goto('/');

        // Footer should be visible
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Page should still load
        await expect(page.locator('body')).toBeVisible();

        // Main content should be visible
        const main = page.locator('main');
        await expect(main).toBeVisible();
    });

    test('should not have console errors', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');

        // Wait for page to settle
        await page.waitForLoadState('networkidle');

        // Filter out known/acceptable errors
        const criticalErrors = errors.filter(error =>
            !error.includes('favicon') &&
            !error.includes('404')
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test('should have accessibility basics', async ({ page }) => {
        await page.goto('/');

        // Should have a main landmark
        const main = page.locator('main');
        await expect(main).toBeVisible();

        // Should have proper heading hierarchy
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThan(0);
    });
});
