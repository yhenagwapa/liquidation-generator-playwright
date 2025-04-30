function parseCurrency(value) {
  if (!value || typeof value !== 'string') return 0;
  return parseFloat(value.trim().replace(/[^\d.-]+/g, ''));
}

// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('List of Cash Advance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://172.31.176.49/liquidation-generator/public/');

      await page.getByLabel('Email').fill('test@gmail.com');
      await page.getByLabel('Password').fill('dswd12345');
      await page.getByRole('button').click();

      await expect(page.url()).toContain('/dashboard');

      await page.getByRole('link', { name: 'List of Cash Advance' }).click();
      await expect(page.url()).toContain('/cash-advances/list');
    });
  
    test('Go to list of cash advance', async ({ page }) => {
      await page.getByRole('link', { name: 'List of Cash Advance' }).click();
      await expect(page.url()).toContain('/cash-advances/list');
    });

    test('Filter cash advance list per amount (DESC)', async ({ page }) => {
      await page.locator('button', { hasText: 'Amount' }).click();

      const rows = await page.locator('table tbody tr');
      const rowsCount  = await rows.count();

      // console.log('Row count:', await rows.count());

      for (let i = 0; i < rowsCount - 1; i++) {

        const firstRowTdValue = await rows.nth(i).locator('td:nth-child(2)').innerText();
        const secondRowTdValue = await rows.nth(i + 1).locator('td:nth-child(2)').innerText(); 
    
        const firstValue = parseCurrency(firstRowTdValue);
        const secondValue = parseCurrency(secondRowTdValue);

        expect(firstValue).toBeLessThanOrEqual(secondValue);
        console.log(firstValue, secondValue);
      }
      
    });

    test('Filter cash advance list per amount (ASC)', async ({ page }) => {
      await page.locator('button', { hasText: 'Amount' }).click();

      const rows = await page.locator('table tbody tr');
      const rowsCount  = await rows.count();
      
      for (let i = 0; i < rowsCount .length - 1; i++) {

        const firstRowTdValue = await rows.nth(i).locator('td:nth-child(2)').innerText();
        const secondRowTdValue = await rows.nth(i + 1).locator('td:nth-child(2)').innerText();
    
        const firstValue = parseCurrency(firstRowTdValue);
        const secondValue = parseCurrency(secondRowTdValue);

        expect(firstValue).toBeGreaterThanOrEqual(secondValue);
        console.log(firstRowTdValue, secondRowTdValue);
      }
      
    });

    test('Filter cash advance list per date (DESC)', async ({ page }) => {
      await page.getByRole('button', { name: 'Date', exact: true }).click();

      const rows = await page.locator('table tbody tr');
      const rowsCount  = await rows.count();

      // console.log('Row count:', await rows.count());

      for (let i = 0; i < rowsCount - 1; i++) {

        const firstRowTdValue = await rows.nth(i).locator('td:nth-child(3)').innerText();
        const secondRowTdValue = await rows.nth(i + 1).locator('td:nth-child(3)').innerText();
    
        const firstValue = new Date(firstRowTdValue.trim());
        const secondValue = new Date(secondRowTdValue.trim());

        expect(firstValue.getTime()).toBeLessThanOrEqual(secondValue.getTime());
      }
      
    });

    test('Filter cash advance list per date (ASC)', async ({ page }) => {
      await page.getByRole('button', { name: 'Date', exact: true }).click();

      const rows = await page.locator('table tbody tr');
      const rowsCount  = await rows.count();

      // console.log('Row count:', await rows.count());

      for (let i = 0; i < rowsCount - 1; i++) {

        const firstRowTdValue = await rows.nth(i).locator('td:nth-child(3)').innerText();
        const secondRowTdValue = await rows.nth(i + 1).locator('td:nth-child(3)').innerText();
    
        const firstValue = new Date(firstRowTdValue.trim());
        const secondValue = new Date(secondRowTdValue.trim());

        expect(firstValue.getTime()).toBeGreaterThanOrEqual(secondValue.getTime());
      }
      
    });

    test('List liquidated cash advances', async ({ page }) => {
      await page.getByRole('button', { name: 'Liquidated', exact: true }).click();

      const rows = await page.locator('table tbody tr');
      const rowsCount  = await rows.count();

      // console.log('Row count:', await rows.count());

      if (rowsCount == 0){
        console.log('No liquidated cash advances.')
      } else {
        for (let i = 0; i < rowsCount - 1; i++) {
          const getValues = await rows.nth(i).locator('td:nth-child(4)').innerText();
          expect(getValues).toBe('Liquidated');
        }
      }
      
    });

    test('List unliquidated cash advances', async ({ page }) => {
      await page.getByRole('button', { name: 'Unliquidated', exact: true }).click();

      const rows = await page.locator('table tbody tr');
      const rowsCount  = await rows.count();

      // console.log('Row count:', await rows.count());

      if (rowsCount == 0){
        console.log('No unliquidated cash advances.')
      } else {
        for (let i = 0; i < rowsCount - 1; i++) {
          const getValues = await rows.nth(i).locator('td:nth-child(4)').innerText();
          expect(getValues).toBe('Unliquidated');
        }
      }
      
    });

    test('Show all cash advances', async ({ page }) => {
      await page.getByRole('button', { name: 'All', exact: true }).click();

      let initialRows = 0;
      let finalRows = 0;
      const totalPages = await page.locator('span[x-text="totalPages"]').textContent();

      for (let i = 0; i < totalPages; i++) {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        initialRows =+ rowsCount;

        if(await page.getByRole('button', { name: 'Next'}).isDisabled){
          break;
        }
        await page.getByRole('button', { name: 'Next'}).click({timeout: 5000});
      }

      await page.getByPlaceholder('Search...').fill('Sample SDO', {timeout: 5000});
      await page.getByPlaceholder('Search...').fill('', {timeout: 5000});

      await page.getByRole('button', { name: 'All', exact: true }).click();
      const finalPages = await page.locator('span[x-text="totalPages"]').textContent();

      for (let i = 0; i < finalPages; i++) {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        finalRows =+ rowsCount;

        if(await page.getByRole('button', { name: 'Next'}).isDisabled){
          break;
        }
        await page.getByRole('button', { name: 'Next'}).click({timeout: 5000});
      }

      expect(initialRows).toBe(finalRows);
    });

    test('Search cash advances', async ({ page }) => {
      const keyword = 'Sample SDO';

      const rows = await page.locator('table tbody tr');
      const rowsCount  = await rows.count();

      await page.getByPlaceholder('Search...').fill(keyword, {timeout: 5000});

      if(rowsCount > 0){
        for (let i = 0; i < rowsCount - 1; i++){
          const firstRowResult = await rows.nth(i).locator('td:nth-child(1)').innerText();

          if(expect(firstRowResult).toBe(keyword)){
            break;
          }
        }
      }
    });

    test('Go to add cash advance', async ({ page }) => {
      await page.getByRole('link', {name: 'Add', exact: true}).click();
      await expect(page.url()).toContain('/cash-advances/add');
    });

    test('Go to import files', async ({ page }) => {
      await page.getByRole('link', {name: 'Import', exact: true}).click();
      await expect(page.url()).toContain('/import-files');
    });
});