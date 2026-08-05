import { expect, test } from '@playwright/test';

test('Chinese Projects page keeps the public route without inventing work', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.getByRole('heading', { level: 1, name: '项目档案' })).toBeVisible();
  await expect(page.getByText('正在整理代表项目')).toBeVisible();
  await expect(page.locator('[data-project-card]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'yehanchen714@gmail.com' })).toBeVisible();
});

test('English Projects page offers collaboration instead of fake cards', async ({ page }) => {
  await page.goto('/en/projects/');
  await expect(page.getByRole('heading', { level: 1, name: 'Selected work' })).toBeVisible();
  await expect(page.getByText('Case studies in progress')).toBeVisible();
  await expect(page.locator('[data-project-card]')).toHaveCount(0);
});
