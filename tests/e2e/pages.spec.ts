import { expect, test } from '@playwright/test';

test('Chinese About covers background, focus, capabilities, principle, and current status', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('真正有用');
  await expect(page.getByText('About Stark Ye', { exact: true })).toBeVisible();
  for (const heading of ['经历', '关注方向', '技术能力', '做事原则', '当前状态']) {
    await expect(page.getByRole('heading', { level: 2, name: heading, exact: true })).toBeVisible();
  }
  await expect(page.getByText('目前欢迎与合作者和技术同行交流')).toBeVisible();
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/about/');
});

test('English About covers background, focus, capabilities, principle, and current status', async ({ page }) => {
  await page.goto('/en/about/');
  for (const heading of ['Background', 'Focus', 'Capabilities', 'Principle', 'Current status']) {
    await expect(page.getByRole('heading', { level: 2, name: heading, exact: true })).toBeVisible();
  }
  await expect(page.getByText('I’m open to conversations with collaborators and technical peers')).toBeVisible();
  await expect(page.getByRole('link', { name: '中文' })).toHaveAttribute('href', '/about/');
});

test('Contact exposes mailto and copies the only public email', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: '发邮件' })).toHaveAttribute('href', 'mailto:yehanchen714@gmail.com');
  await page.getByRole('button', { name: '复制邮箱' }).click();
  await expect(page.getByRole('status')).toHaveText('邮箱已复制');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('yehanchen714@gmail.com');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('Contact keeps the email usable without showing a dead copy control', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.getByRole('link', { name: 'yehanchen714@gmail.com', exact: true }))
      .toHaveAttribute('href', 'mailto:yehanchen714@gmail.com');
    await expect(page.getByRole('button', { name: '复制邮箱' })).toHaveCount(0);
  });
});

test('404 chooses copy from the requested path language', async ({ page }) => {
  await page.goto('/missing-page/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('页面没有找到');
  await page.goto('/en/missing-page/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Page not found');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
