import { expect, test } from '@playwright/test';

function captureRuntimeErrors(page) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  return () => {
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  };
}

test.describe('lesson acceptance', () => {
  test('index card navigation updates the lesson URL and browser history', async ({ page }) => {
    const assertNoRuntimeErrors = captureRuntimeErrors(page);

    await page.goto('/');
    await page.getByRole('button', { name: 'Open SWIM' }).click();

    await expect(page).toHaveURL(/lesson=swim/);
    await expect(page).toHaveTitle('SWIM');
    await expect(page.getByRole('main', { name: 'SWIM' })).toBeVisible();

    await page.goBack();

    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle('Glassbox');
    await expect(page.getByRole('main', { name: 'Glassbox' })).toBeVisible();
    assertNoRuntimeErrors();
  });

  test('ACID atomicity lab can switch WAL recovery scenarios', async ({ page }) => {
    const assertNoRuntimeErrors = captureRuntimeErrors(page);

    await page.goto('/?lesson=acid-lab');

    await expect(page.getByRole('heading', { name: 'The Successful Commit' })).toBeVisible();
    await page.getByRole('button', { name: 'Crash After Commit' }).click();

    await expect(page.getByRole('heading', { name: 'The Crash After Commit' })).toBeVisible();
    await expect(page.getByText(/COMMIT marker has been fsync'd/)).toBeVisible();
    assertNoRuntimeErrors();
  });

  test('SWIM probe lab starts the direct probe state machine', async ({ page }) => {
    const assertNoRuntimeErrors = captureRuntimeErrors(page);

    await page.goto('/?lesson=swim');

    await expect(page.getByText('One protocol round')).toBeVisible();
    await page.getByRole('button', { name: /Run probe/ }).click();

    await expect(page.getByText(/direct ping out|ack received/)).toBeVisible();
    assertNoRuntimeErrors();
  });
});
