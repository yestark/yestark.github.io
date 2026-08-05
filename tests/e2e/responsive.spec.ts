import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

for (const route of ['/', '/about/', '/thoughts/', '/projects/', '/contact/', '/en/']) {
  test(`${route} has no horizontal overflow on mobile`, async ({ page }) => {
    await page.goto(route);
    const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  });
}

test('mobile homepage preserves approved sections in DOM and vertical order', async ({ page }) => {
  await page.goto('/');
  const sections = page.locator('main > [data-section]');
  await expect(sections).toHaveCount(5);
  const layout = await sections.evaluateAll((nodes) => nodes.map((node) => ({
    section: node.getAttribute('data-section'),
    top: node.getBoundingClientRect().top,
  })));

  expect(layout.map(({ section }) => section)).toEqual(['hero', 'thoughts', 'projects', 'contact', 'mini-about']);
  expect(layout.map(({ top }) => top)).toEqual([...layout.map(({ top }) => top)].toSorted((a, b) => a - b));
});

test('mobile Mini About remains more compact than Contact', async ({ page }) => {
  await page.goto('/');
  const hierarchy = await page.locator('[data-section="contact"], [data-section="mini-about"]').evaluateAll((nodes) =>
    nodes.map((node) => ({ section: node.getAttribute('data-section'), height: node.getBoundingClientRect().height })),
  );
  const contact = hierarchy.find(({ section }) => section === 'contact');
  const miniAbout = hierarchy.find(({ section }) => section === 'mini-about');

  expect(contact).toBeDefined();
  expect(miniAbout).toBeDefined();
  expect(miniAbout!.height).toBeLessThan(contact!.height);
});
