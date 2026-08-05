import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const route of ['/', '/about/', '/thoughts/', '/projects/', '/contact/', '/en/']) {
  test(`${route} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('keyboard navigation exposes the skip link and primary navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到主要内容' })).toBeFocused();

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const primaryLink = page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '首页' });
  await expect(primaryLink).toBeFocused();
  await expect(primaryLink).toBeVisible();
  const focusIndicator = await primaryLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), boxShadow: style.boxShadow };
  });
  expect(
    (focusIndicator.outlineStyle !== 'none' && focusIndicator.outlineWidth > 0) || focusIndicator.boxShadow !== 'none',
  ).toBe(true);

  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: '跳到主要内容' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('reduced motion removes meaningful animation duration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page.locator('body').evaluate((element) => parseFloat(getComputedStyle(element).animationDuration) || 0);
  expect(duration).toBeLessThanOrEqual(0.001);
});

test('404 navigation has a localized accessible name', async ({ page }) => {
  await page.goto('/missing-page/');
  await expect(page.getByRole('navigation', { name: '404 导航' })).toBeVisible();

  await page.goto('/en/missing-page/');
  await expect(page.getByRole('navigation', { name: '404 navigation' })).toBeVisible();
});
