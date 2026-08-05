import { expect, test } from '@playwright/test';

test('About stays a focused standalone page', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('真正有用');
  await expect(page.getByText('About Stark Ye', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/about/');
});

test('Contact exposes mailto and copies the only public email', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: '发邮件' })).toHaveAttribute('href', 'mailto:yehanchen714@gmail.com');
  await page.getByRole('button', { name: '复制邮箱' }).click();
  await expect(page.getByRole('status')).toHaveText('邮箱已复制');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('yehanchen714@gmail.com');
});

test('404 chooses copy from the requested path language', async ({ page }) => {
  await page.goto('/missing-page/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('页面没有找到');
  await page.goto('/en/missing-page/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Page not found');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
