import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
    test('Homepage Snapshot', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/IntraWeb/i);
        await expect(page).toHaveScreenshot('homepage.png', { fullPage: true });
    });

    test('About Page Snapshot', async ({ page }) => {
        await page.goto('/about');
        await expect(page.getByRole('heading', { name: /About/i, level: 1 })).toBeVisible();
        await expect(page).toHaveScreenshot('about.png', { fullPage: true });
    });

    test('Careers Page Snapshot', async ({ page }) => {
        await page.goto('/careers');
        await expect(page.getByRole('heading', { name: /Join Our Team/i })).toBeVisible();
        await expect(page).toHaveScreenshot('careers.png', { fullPage: true });
    });
});
