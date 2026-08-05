import { expect, test } from '@playwright/test';

test('serves the Stark Ye homepage in Chinese', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Stark Ye/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByText(/Stark Ye/).first()).toBeVisible();
});
