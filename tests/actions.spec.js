import { test, expect } from '@playwright/test';

test.describe('Actions in List of Cash Advance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://172.26.120.49/liquidation-generator/public/');

      await page.getByLabel('Email').fill('test@gmail.com');
      await page.getByLabel('Password').fill('Dswd@12345');
      await page.getByRole('button').click();

      await expect(page.url()).toContain('/dashboard');

      await page.getByRole('link', { name: 'List of Cash Advance' }).click();
      await expect(page.url()).toContain('/cash-advances/list');
    });

    test('Go to liquidation report', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        let sdoname = '';

        if(rowsCount > 0){
            sdoname = await rows.nth(0).locator('td:nth-child(1)').innerText();
        } else {
            test.skip('No cash advance found.');
        }
        
        await page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[1]').click({timeout: 3000});
        await expect(page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[2]')).toBeVisible();


        const [newPage] = await Promise.all([
            page.context().waitForEvent('page', {timeout: 60000}),
            page.getByRole('link', {name: 'Liquidation Report', exact: true}).click(),
        ]);

        await newPage.waitForLoadState('load', { timeout: 60000 });
        await expect(newPage).toHaveURL(/liquidation-report/, { timeout: 60000 });

        const sdoInNewOpenedPage = await newPage.locator('//p[@x-text="mapped_cash_advance_details.special_disbursing_officer"]').textContent();
        
        await expect(sdoInNewOpenedPage).toBe(sdoname);
        
    });

    test('Set liquidation type as partial/full', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        let sdoname = '';

        if(rowsCount > 0){
            sdoname = await rows.nth(0).locator('td:nth-child(1)').innerText();
        } else {
            test.skip('No cash advance found.');
        }
        
        await page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[1]').click({timeout: 3000});
        await expect(page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[2]')).toBeVisible();

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page', {timeout: 60000}), 
            page.getByRole('link', {name: 'Liquidation Report', exact: true}).click(),
        ]);

        // await newPage.waitForLoadState('load');
        await expect(newPage).toHaveURL(/liquidation-report/, { timeout: 60000 });
        
        await newPage.locator('#liquidationType').selectOption('Partial', {timeout:3000});
        const selectedText = await newPage.locator('select#liquidationType >> option:checked').innerText();
        
        const spanText = await newPage.locator('//span[@x-text="liquidationType"]').textContent({timeout:3000});
        
        await expect(spanText).toBe(selectedText);

        await newPage.locator('#liquidationType').selectOption('Full', {timeout:3000});
        const selectedText2 = await newPage.locator('select#liquidationType >> option:checked').innerText();

        const spanText2 = await newPage.locator('//span[@x-text="liquidationType"]').textContent({timeout:3000});

        await expect(spanText2).toBe(selectedText2);
        
    });

    test('Print liquidation report', async ({ page, context }) => {
        await context.addInitScript(() => {
            window.__printCalled = false;
            window.print = () => {
              window.__printCalled = true;
            };
          });

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        let sdoname = '';

        if(rowsCount > 0){
            sdoname = await rows.nth(0).locator('td:nth-child(1)').innerText();
        } else {
            test.skip('No cash advance found.');
        }
        
        await page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[1]').click({timeout: 3000});
        await expect(page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[2]')).toBeVisible();

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page', {timeout: 60000}), 
            page.getByRole('link', {name: 'Liquidation Report', exact: true}).click(),
        ]);

        await newPage.addInitScript(() => {
            window.print = () => {
              console.log('Print dialog triggered');
              window.__printFired = true;
            };
        });

        await newPage.waitForLoadState('load', { timeout: 60000 });
        await expect(newPage).toHaveURL(/liquidation-report/, { timeout: 60000 });

        await newPage.getByRole('button', {name : 'Print'}).click();

        const wasPrintCalled = await newPage.evaluate(() => window.__printCalled);
        expect(wasPrintCalled).toBe(true);
    });

    test('Go to report of cash disbursements', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        let sdoname = '';

        if(rowsCount > 0){
            sdoname = await rows.nth(0).locator('td:nth-child(1)').innerText();
        } else {
            test.skip('No cash advance found.');
        }
        
        await page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[1]').click({timeout: 3000});
        await expect(page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[2]')).toBeVisible();

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page', {timeout: 60000}), 
            page.getByRole('link', {name: 'Report Cash Disbursements', exact: true}).click(),
            
        ]);

        await expect(newPage).toHaveURL(/rcd/, { timeout: 60000 });

        const sdoInNewOpenedPage = await newPage.locator('//span[@x-text="mapped_cash_advance_details.special_disbursing_officer"]').textContent();
        
        await expect(sdoInNewOpenedPage).toBe(sdoname);
        
    });

    test('Set RCD as partial/full', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        let sdoname = '';

        if(rowsCount > 0){
            sdoname = await rows.nth(0).locator('td:nth-child(1)').innerText();
        } else {
            test.skip('No cash advance found.');
        }
        
        await page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[1]').click({timeout: 3000});
        await expect(page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[2]')).toBeVisible();

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page', {timeout: 60000}), 
            page.getByRole('link', {name: 'Report Cash Disbursement', exact: true}).click(),
        ]);

        // await newPage.waitForLoadState('load');
        await expect(newPage).toHaveURL(/rcd/, { timeout: 60000 });
        
        await newPage.locator('#liquidationType').selectOption('Partial', {timeout:3000});
        const selectedText = await newPage.locator('select#liquidationType >> option:checked').innerText();
        
        const spanText = await newPage.locator('//span[@x-text="liquidationType"]').textContent({timeout:3000});
        
        await expect(spanText).toBe(selectedText);

        await newPage.locator('#liquidationType').selectOption('Full', {timeout:3000});
        const selectedText2 = await newPage.locator('select#liquidationType >> option:checked').innerText();

        const spanText2 = await newPage.locator('//span[@x-text="liquidationType"]').textContent({timeout:3000});

        await expect(spanText2).toBe(selectedText2);
        
    });

    test('Set RCD liquidation mode as per bundle/overall', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        let sdoname = '';

        if(rowsCount > 0){
            sdoname = await rows.nth(0).locator('td:nth-child(1)').innerText();
        } else {
            test.skip('No cash advance found.');
        }
        
        await page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[1]').click({timeout: 3000});
        await expect(page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[2]')).toBeVisible();

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page', {timeout: 60000}), 
            page.getByRole('link', {name: 'Report Cash Disbursements', exact: true}).click(),
        ]);

        // await newPage.waitForLoadState('load');
        await expect(newPage).toHaveURL(/rcd/, { timeout: 60000 });

        await newPage.selectOption('select#liquidationMode', { label: 'Per Bundle'});

        const bundleOptions = await newPage.locator('//div//input[@id="nameFrom"]');
        await expect(bundleOptions).toBeVisible();

        await newPage.selectOption('select#liquidationMode', { label: 'Overall'});

        const bundleOptions2 = await newPage.wai('//div//input[@id="nameFrom"]');
        await expect(bundleOptions2).toBeHidden();
    });

    test('Set RCD name range if liquidation mode is bundle', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        let sdoname = '';

        if(rowsCount > 0){
            sdoname = await rows.nth(0).locator('td:nth-child(1)').innerText();
        } else {
            test.skip('No cash advance found.');
        }
        
        await page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[1]').click({timeout: 3000});
        await expect(page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[2]')).toBeVisible();

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page', {timeout: 60000}), 
            page.getByRole('link', {name: 'Report Cash Disbursements', exact: true}).click(),
        ]);

        // await newPage.waitForLoadState('load');
        await expect(newPage).toHaveURL(/rcd/, { timeout: 60000 });

        await newPage.selectOption('select#liquidationMode', { label: 'Per Bundle'});

        const bundleOptions = await newPage.locator('//div//input[@id="nameFrom"]');
        await expect(bundleOptions).toBeVisible();

        await newPage.selectOption('select#liquidationMode', { label: 'Overall'});

        const bundleOptions2 = await newPage.wai('//div//input[@id="nameFrom"]');
        await expect(bundleOptions2).toBeHidden();
    });

    test('Go to cash disbursement record', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        let sdoname = '';

        if(rowsCount > 0){
            sdoname = await rows.nth(0).locator('td:nth-child(1)').innerText();
        } else {
            test.skip('No cash advance found.');
        }
        
        await page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[1]').click({timeout: 3000});
        await expect(page.locator('//*[@id="table-body"]/tr[1]/td[5]/div/div[1]/div[2]')).toBeVisible();

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page', {timeout: 60000}), 
            page.getByRole('link', {name: 'Cash Disbursement Record', exact: true}).click(),
        ]);

        await expect(newPage).toHaveURL(/cdr/, { timeout: 60000 });

        const sdoInNewOpenedPage = await newPage.locator('//th/span[@x-text="mapped_cash_advance_details.special_disbursing_officer"]').textContent();
        
        await expect(sdoInNewOpenedPage).toBe(sdoname);
        
    });

});