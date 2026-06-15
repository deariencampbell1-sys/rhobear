const { test, expect } = require('@playwright/test');

const DEMO_URL = 'https://rhobear.ai/try.html';

async function sendAndExpectReply(page, operatorId, message) {
  const input = page.locator('#try-chat-input');
  const before = await page.locator(`.try-message.bot[data-operator="${operatorId}"] .try-msg-text`).evaluateAll((nodes) => (
    nodes.filter((node) => node.textContent && node.textContent.trim().length > 0).length
  ));

  await input.fill(message);
  await input.press('Enter');

  await expect
    .poll(async () => page.locator(`.try-message.bot[data-operator="${operatorId}"] .try-msg-text`).evaluateAll((nodes) => (
      nodes.filter((node) => node.textContent && node.textContent.trim().length > 0).length
    )), {
      message: `${operatorId} should render a non-empty assistant reply`,
      timeout: 30_000,
    })
    .toBeGreaterThan(before);
}

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ path: testInfo.outputPath('failure.png'), fullPage: true });
  }
});

test('try.html chat renders replies for multiple operators', async ({ page }) => {
  await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });

  const listbox = page.getByRole('listbox', { name: /choose active rhobear crew voice/i });
  await expect(listbox).toBeVisible({ timeout: 30_000 });

  const options = listbox.getByRole('option');
  await expect(options).toHaveCount(9, { timeout: 30_000 });

  await listbox.locator('[data-operator="spark"]').click();
  await sendAndExpectReply(page, 'spark', 'what is RHOBEAR?');

  await listbox.locator('[data-operator="guardian"]').click();
  await sendAndExpectReply(page, 'guardian', 'where do you live?');
});
