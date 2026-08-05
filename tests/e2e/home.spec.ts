import { expect, test } from '@playwright/test';

for (const route of ['/', '/en/']) {
  test(`${route} preserves the approved homepage order`, async ({ page }) => {
    await page.goto(route);
    const order = await page.locator('main [data-section]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-section')),
    );
    expect(order).toEqual(['hero', 'articles', 'projects', 'contact', 'mini-about']);
  });
}

test('homepage uses the approved Obsidian palette and Article action', async ({ page }) => {
  await page.goto('/');
  const tokens = await page.locator('html').evaluate((node) => ({
    page: getComputedStyle(node).getPropertyValue('--color-page').trim(),
    accent: getComputedStyle(node).getPropertyValue('--color-accent').trim(),
  }));
  expect(tokens).toEqual({ page: '#070806', accent: '#e8b84f' });
  await expect(page.getByRole('link', { name: '阅读我的文章' })).toHaveAttribute('href', '/articles/');
  await expect(page.locator('[data-orbit]')).toBeVisible();
});

test('homepage is honest when no public content exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('文章正在写作中')).toBeVisible();
  await expect(page.getByText('正在整理代表项目')).toBeVisible();
  await expect(page.locator('[data-content-card]')).toHaveCount(0);
});

test('mini about remains below contact and visually compact', async ({ page }) => {
  await page.goto('/');
  const contactBox = await page.locator('[data-section="contact"]').boundingBox();
  const aboutBox = await page.locator('[data-section="mini-about"]').boundingBox();
  expect(aboutBox!.y).toBeGreaterThan(contactBox!.y);
  expect(aboutBox!.height).toBeLessThan(contactBox!.height);
});
