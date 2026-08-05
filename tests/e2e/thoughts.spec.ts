import { expect, test } from '@playwright/test';

test('Chinese Thoughts index renders a truthful empty state', async ({ page }) => {
  await page.goto('/thoughts/');
  await expect(page).toHaveTitle(/想法.*Stark Ye/);
  await expect(page.getByRole('heading', { level: 1, name: '最近的想法' })).toBeVisible();
  await expect(page.getByText('文章正在写作中')).toBeVisible();
  await expect(page.locator('[data-thought-card]')).toHaveCount(0);
});

test('English Thoughts index has English chrome and no fabricated posts', async ({ page }) => {
  await page.goto('/en/thoughts/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Recent thoughts' })).toBeVisible();
  await expect(page.getByText('Notes in progress')).toBeVisible();
});
