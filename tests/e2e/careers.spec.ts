import { test, expect } from '@playwright/test';

test.describe('Careers Page', () => {
    test('should load careers page', async ({ page }) => {
        await page.goto('/careers');

        // Check page loaded
        await expect(page.locator('body')).toBeVisible();

        // Should have main content
        const main = page.locator('main');
        await expect(main).toBeVisible();
    });

    test('should display page heading', async ({ page }) => {
        await page.goto('/careers');

        // Check for heading
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();
    });

    test('should have job listings or careers content', async ({ page }) => {
        await page.goto('/careers');

        // Page should have meaningful content beyond just navigation
        const main = page.locator('main');
        const textContent = await main.textContent();

        // Should have some substantial content
        expect(textContent?.length).toBeGreaterThan(50);
    });

    test('should navigate from footer careers link', async ({ page }) => {
        await page.goto('/');

        // Look for careers link in footer
        const careersLink = page.getByRole('link', { name: /careers/i }).first();

        if (await careersLink.count() > 0) {
            await careersLink.click();

            // Should navigate to careers page
            await expect(page).toHaveURL(/\/careers/);
        }
    });

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/careers');

        // Page should load properly
        await expect(page.locator('main')).toBeVisible();
    });

    test('should have proper meta information', async ({ page }) => {
        await page.goto('/careers');

        // Should have a title
        await expect(page).toHaveTitle(/.+/);
    });

    test('individual job pages should load', async ({ page }) => {
        // Test one of the job detail pages if they exist
        const jobPaths = [
            '/careers/senior-full-stack-engineer',
            '/careers/ai-ml-engineer',
            '/careers/cloud-solutions-architect',
            '/careers/devops-engineer',
            '/careers/senior-frontend-developer'
        ];

        // Try to load one job page
        const response = await page.goto(jobPaths[0]);

        if (response?.status() === 200) {
            // If the page exists, it should have content
            await expect(page.locator('main')).toBeVisible();

            // Should have a heading
            const h1 = page.locator('h1').first();
            await expect(h1).toBeVisible();
        }
    });
});
