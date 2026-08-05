import { expect, test } from '@playwright/test';

test('Archive exposes shareable Article and Tag filters', async ({ page }) => {
  await page.goto('/archive/?type=article&tag=ai');
  await expect(page.getByRole('heading', { level: 1, name: '归档' })).toBeVisible();
  await expect(page.getByLabel('内容类型')).toHaveValue('article');
  await expect(page.getByLabel('标签')).toHaveValue('ai');
  await expect(page.getByRole('status')).toContainText('0');
  await page.reload();
  await expect(page).toHaveURL(/type=article&tag=ai/);
});

test('English Archive has localized controls', async ({ page }) => {
  await page.goto('/en/archive/');
  await expect(page.getByRole('heading', { level: 1, name: 'Archive' })).toBeVisible();
  await expect(page.getByLabel('Content type')).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('Archive keeps its semantic content available', async ({ page }) => {
    await page.goto('/archive/');
    await expect(page.getByRole('heading', { level: 1, name: '归档' })).toBeVisible();
    await expect(page.locator('[data-filter-controls]')).toHaveCount(0);
  });
});
