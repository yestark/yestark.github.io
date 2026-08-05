import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

for (const route of ['/', '/about/', '/thoughts/', '/projects/', '/contact/', '/en/']) {
  test(`${route} has no horizontal overflow on mobile`, async ({ page }) => {
    await page.goto(route);
    const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  });
}

test('mobile homepage preserves all approved sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-section="hero"]')).toBeVisible();
  await expect(page.locator('[data-section="contact"]')).toBeVisible();
  await expect(page.locator('[data-section="mini-about"]')).toBeVisible();
});
