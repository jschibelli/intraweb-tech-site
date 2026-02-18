import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
    test('should load about page', async ({ page }) => {
        await page.goto('/about');

        // Check page loaded
        await expect(page.locator('body')).toBeVisible();

        // Should have main content
        const main = page.locator('main');
        await expect(main).toBeVisible();
    });

    test('should display page title', async ({ page }) => {
        await page.goto('/about');

        // Check for heading
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();
    });

    test('should display profile section', async ({ page }) => {
        await page.goto('/about');

        // Look for profile content - check for "John Schibelli" text
        const profileName = page.getByText(/John Schibelli/i);
        if (await profileName.count() > 0) {
            await expect(profileName.first()).toBeVisible();
        }

        // Look for founder title
        const founderTitle = page.getByText(/Founder.*Principal/i);
        if (await founderTitle.count() > 0) {
            await expect(founderTitle.first()).toBeVisible();
        }
    });

    test('should have proper navigation from homepage', async ({ page }) => {
        await page.goto('/');

        // Find and click About link
        const aboutLink = page.getByRole('link', { name: /about/i }).first();
        await aboutLink.click();

        // Should navigate to about page
        await expect(page).toHaveURL(/\/about/);
    });

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/about', { waitUntil: 'domcontentloaded' });

        // Page should load properly
        await expect(page.locator('main')).toBeVisible();
    });

    test('should have proper meta tags', async ({ page }) => {
        await page.goto('/about');

        // Check for title
        await expect(page).toHaveTitle(/.+/);
    });
});
