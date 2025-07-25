// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Cash Advance Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://172.31.176.49/liquidation-generator/public/');

      await page.getByLabel('Email').fill('test@gmail.com');
      await page.getByLabel('Password').fill('Dswd@12345');
      await page.getByRole('button', { name: 'Log in' }).click();

      await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
      
      await page.getByRole('link', { name: 'Cash Advance' }).click();
      await expect(page.getByRole('heading', { name: 'Cash Advance', exact: true })).toBeVisible();
      
    });

    test('Add cash advance using valid entries', async ({ page }) => {
      await page.getByRole('link', { name: 'Add Cash Advance' }).click();
      await expect(page.getByRole('heading', { name: 'Add Cash Advances', exact: true })).toBeVisible();

      await page.getByLabel('Special Disbursing Officer').fill('SDO Test');
      await page.getByLabel('Position').fill('Valid Position');
      await page.getByLabel('Station').fill('Valid Station');
      await page.getByLabel('Check Number').fill('ABCDEF123456');
      await page.getByLabel('Cash Advance Amount').fill('1000000');
      await page.getByLabel('Check Date').fill('2025-04-01');
      await page.getByLabel('DV Number').fill('123456789');
      await page.getByLabel('ORS/BURS Number').fill('123456789');
      await page.getByLabel('Responsibility Code').fill('123456789');
      await page.getByLabel('UACS Object Code').fill('123456789');
      
      await page.getByRole('button', { name: 'Add Cash Advance' }).click();

      const alert = page.getByRole('alert');
      await alert.waitFor({ state: 'visible', timeout: 5000 });
      await expect(alert).toHaveText('Added Successfully');
      await expect(alert).toBeHidden({ timeout: 5000 });
    });

    test('Add cash advance using invalid entries (cash advance amount > 75m and cash advance date > today)', async ({ page }) => {
      await page.getByRole('link', { name: 'Add Cash Advance' }).click();
      await expect(page.getByRole('heading', { name: 'Add Cash Advances', exact: true })).toBeVisible();

      await page.getByLabel('Special Disbursing Officer').fill('Sample invalid SDO');
      await page.getByLabel('Position').fill('Sample invalid Position');
      await page.getByLabel('Station').fill('Sample invalid Station');
      await page.getByLabel('Check Number').fill('ABCDEF123456!@#$%');
      await page.getByLabel('Cash Advance Amount').fill('100000000');
      await page.getByLabel('Check Date').fill('2026-04-01');
      await page.getByLabel('DV Number').fill('ABCDEF123456!@#$%');
      await page.getByLabel('ORS/BURS Number').fill('ABCDEF123456!@#$%');
      await page.getByLabel('Responsibility Code').fill('ABCDEF123456!@#$%');
      await page.getByLabel('UACS Object Code').fill('ABCDEF123456!@#$%');
      
      await page.getByRole('button', { name: 'Add Cash Advance' }).click();

      const alert = page.getByRole('alert');
      await alert.waitFor({ state: 'visible', timeout: 5000 });
      await expect(alert).toHaveText(/There were some issues with your submission:/);
    });

    test('Required field shows validation message when empty', async ({ page }) => {
      await page.getByRole('link', { name: 'Add Cash Advance' }).click();
      await expect(page.getByRole('heading', { name: 'Add Cash Advances', exact: true })).toBeVisible();

      await page.getByRole('button', { name: 'Add Cash Advance' }).click();

      const input = page.locator('input[name="special_disbursing_officer"]');

      const message = await input.evaluate((el, HTMLInputElement) => el.validationMessage);
      expect(message).toBe('Please fill out this field.');  
    });


});