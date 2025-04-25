import { test, expect } from '@playwright/test';

test('Can access server', async ({ page }) => {
    const response = await page.goto('https://172.31.176.49/');
    expect(response?.ok()).toBeTruthy();
    console.log('Status:', response?.status());
});