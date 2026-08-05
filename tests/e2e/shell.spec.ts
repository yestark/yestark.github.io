import { expect, test } from '@playwright/test';

test('Chinese shell exposes all primary destinations and English alternate', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: '主导航' });
  await expect(navigation.getByRole('link')).toHaveCount(7);
  await expect(navigation.getByRole('link', { name: '文章' })).toHaveAttribute('href', '/articles/');
  await expect(navigation.getByRole('link', { name: '归档' })).toHaveAttribute('href', '/archive/');
  await expect(navigation.getByRole('link', { name: '联系我' })).toHaveAttribute('href', '/#contact');
  await expect(navigation.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/');
  await expect(page.locator('footer')).toContainText('Stark Ye');
});

test('English shell links back to Chinese', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }))
    .toContainText('Articles');
  await expect(page.getByRole('link', { name: '中文' })).toHaveAttribute('href', '/');
});
