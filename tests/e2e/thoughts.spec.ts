import { expect, test } from '@playwright/test';

test('Chinese Articles index renders a truthful empty state', async ({ page }) => {
  await page.goto('/articles/');
  await expect(page).toHaveTitle(/文章.*Stark Ye/);
  await expect(page.getByRole('heading', { level: 1, name: '最近的文章' })).toBeVisible();
  await expect(page.getByText('文章正在写作中')).toBeVisible();
  await expect(page.locator('[data-article-card]')).toHaveCount(0);
});

test('English Articles index has English chrome and no fabricated posts', async ({ page }) => {
  await page.goto('/en/articles/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Recent articles' })).toBeVisible();
  await expect(page.getByText('Notes in progress')).toBeVisible();
});

test('legacy Thoughts indexes redirect to Articles', async ({ page }) => {
  await page.goto('/thoughts/');
  await expect(page).toHaveURL('/articles/');
  await page.goto('/en/thoughts/');
  await expect(page).toHaveURL('/en/articles/');
});
