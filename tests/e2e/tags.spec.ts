import { expect, test } from '@playwright/test';

test('Chinese Tag index is available without invented content', async ({ page }) => {
  await page.goto('/tags/');
  await expect(page.getByRole('heading', { level: 1, name: 'Tags' })).toBeVisible();
  await expect(page.getByText('还没有公开标签')).toBeVisible();
});

test('English Tag index is localized', async ({ page }) => {
  await page.goto('/en/tags/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Tags' })).toBeVisible();
  await expect(page.getByText('No public Tags yet')).toBeVisible();
});
