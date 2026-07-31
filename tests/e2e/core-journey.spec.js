import { test, expect } from '@playwright/test';

test.describe('Core User Journey', () => {
  test('User can open practice page and run a query', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Ensure the home page loaded
    await expect(page.getByText('Master SQL.')).toBeVisible();

    // Click on Practice
    await page.getByRole('link', { name: 'Practice' }).first().click();

    // Ensure practice page loaded (has SQL Editor)
    await expect(page.locator('.monaco-editor')).toBeVisible();

    // Click the Run button
    await page.getByRole('button', { name: 'Run' }).click();

    // Wait for the query to execute and results to show
    await expect(page.getByText('Query Result')).toBeVisible({ timeout: 10000 });

    // Check if table contains data (th or td)
    const tableHeaders = page.locator('table th');
    await expect(tableHeaders.first()).toBeVisible();
  });
});
