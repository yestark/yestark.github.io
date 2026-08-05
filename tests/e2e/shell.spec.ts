import { expect, test } from '@playwright/test';

test('Chinese shell exposes all primary destinations and English alternate', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: '主导航' });
  await expect(navigation.getByRole('link')).toHaveCount(6);
  await expect(navigation.getByRole('link', { name: '想法' })).toHaveAttribute('href', '/thoughts/');
  await expect(navigation.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/');
  await expect(page.locator('footer')).toContainText('Stark Ye');
});

test('English shell links back to Chinese', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }))
    .toContainText('Thoughts');
  await expect(page.getByRole('link', { name: '中文' })).toHaveAttribute('href', '/');
});
