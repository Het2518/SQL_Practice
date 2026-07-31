import { test, expect } from '@playwright/test';

test('has title and main heading', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/DataDesk|SQL Practice/i);

  // Expect the main hero heading to be visible
  const heading = page.getByRole('heading', { name: /Master SQL/i });
  await expect(heading).toBeVisible();

  // Expect the Start Practicing button to be visible
  const startButton = page.getByRole('button', { name: /Start Practicing/i });
  await expect(startButton).toBeVisible();
});
