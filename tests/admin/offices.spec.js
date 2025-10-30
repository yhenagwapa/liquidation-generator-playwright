// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe.serial('Offices Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://172.26.120.49/liquidation-generator/public/');

        await page.getByLabel('Email').fill('test@gmail.com');
        await page.getByLabel('Password').fill('Dswd@12345');
        await page.getByRole('button', { name: 'Log in' }).click();

        await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
        
        await page.getByRole('link', { name: 'Offices' }).click();
        await expect(page.getByRole('heading', { name: 'Offices', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/office');
    });

    test('Can add office using valid entries', async ({ page }) => {
        //fill-out form and click register button
        await page.getByLabel('Office Name').fill('Davao del Sur Office');
        await page.getByLabel('Office Location (Municipality/City only)').fill('Davao del Sur');
        await page.getByLabel('Swado / Team Leader').fill('Davao del Sur TL');
        await page.getByRole('button', { name: 'Register' }).click();

        // Wait for alert to appear
        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 10000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/added successfully/i);

        // Wait for it to disappear (whether hidden or removed)
        await expect(alert).toBeHidden({ timeout: 10000 });

    });

    test('Cannot add office using invalid entries', async ({ page }) => {
        //fill-out form and click register button
        await page.getByLabel('Office Name').fill('!@#$%^');
        await page.getByLabel('Office Location (Municipality/City only)').fill('!@#$%^');
        await page.getByLabel('Swado / Team Leader').fill('!@#$%^');
        await page.getByRole('button', { name: 'Register' }).click();

        // Wait for alert to appear
        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 3000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/there were some issues with your submission/i);
    });

    test('Cannot add office if required field/s are empty', async ({ page }) => {
        //fill-out some fields and click register button
        await page.getByLabel('Swado / Team Leader').fill('Testing');
        await page.getByRole('button', { name: 'Register' }).click();

        const input = await page.getByRole('textbox', { name: 'Office Name' })

        const message = await input.evaluate((el, HTMLInputElement) => el.validationMessage);
        expect(message).toBe('Please fill out this field.'); 
    });

    test('Cannot add office if all fields are empty', async ({ page }) => {
        await page.getByRole('button', { name: 'Register' }).click();

        const input = await page.getByRole('textbox', { name: 'Office Name' });

        const message = await input.evaluate((el, HTMLInputElement) => el.validationMessage);
        expect(message).toBe('Please fill out this field.'); 
    });

    test('Cannot add office if duplicate entry', async ({ page }) => {
        await page.waitForSelector('table tbody tr');
        const row = page.locator('table tbody tr').nth(1);

        const officeName = await row.locator('td').nth(0).innerText();
        const officeAddress = await row.locator('td').nth(1).innerText();
        const swado = await row.locator('td').nth(2).innerText();

        await page.getByLabel('Office Name').fill(programName);
        await page.getByLabel('Office Location (Municipality/City only)').fill(officeAddress);
        await page.getByLabel('Swado / Team Leader').fill(swado);
        await page.getByRole('button', { name: 'Register' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 3000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
    });

    test('Displays result if exact match is searched', async ({ page }) => {
        const keyword = 'Davao del Norte Swad Office';

        await page.getByPlaceholder('Search...').fill(keyword);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if(rowsCount > 0){
            for (let i = 0; i < rowsCount - 1; i++){
                const firstRowResult = await rows.nth(i).locator('td:nth-child(1)').innerText();

                if(expect(firstRowResult).toBe(keyword)){
                    break;
                }
            }
        }
    });

    test('Displays result if partial match is searched', async ({ page }) => {
        const keyword = 'Sam';

        await page.getByPlaceholder('Search...').fill(keyword);
        await page.keyboard.press('Enter');

        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if(rowsCount > 0){
            for (let i = 0; i < rowsCount - 1; i++){
                const firstRowResult = await rows.nth(i).locator('td:nth-child(1)').innerText();

                expect(firstRowResult.includes(keyword));
            }
        }
    });

    test('Displays result if no match is searched', async ({ page }) => {
        const keyword = 'Region';

        await page.getByPlaceholder('Search...').fill(keyword);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if(rowsCount > 0){
            for (let i = 0; i < rowsCount - 1; i++){
                const firstRowResult = await rows.nth(i).locator('td:nth-child(1)').innerText();

                if(expect(firstRowResult).toBe('No SDOs found.')){
                    break;
                }
            }
        }
    });

    test('Can open edit modal', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let officeName;

        if (rowsCount === 0) {
            console.log('No office found. Test skipped.');
            test.skip('No office found.');
        } else{
            officeName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateOfficeModal" ]');
        await expect(modal).toBeVisible();

        const office = await modal.locator('#office_name').inputValue();

        await expect(office).toBe(officeName);
    });

    test('Can edit office using valid entries', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let officeName;

        if (rowsCount === 0) {
            console.log('No office found. Test skipped.');
            test.skip('No office found.');
        } else{
            officeName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[x-show="updateOfficeModal"]');
        await expect(modal).toBeVisible();

        //fill-out form and click register button
        const input = await modal.locator('input[name="office_name"]');
        await expect(input).toHaveAttribute('readonly', '');
        await modal.locator('input[name="office_location"]').fill('Tagum City Edited');
        await modal.locator('input[name="swado"]').fill('Ricky Tijon Edited');
        await modal.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 3000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/updated successfully/i);

        // pause for 3 seconds
        await page.waitForTimeout(3000);

        const updatedOffice = await rows.nth(0).locator('td:nth-child(1)').innerText();

        await expect(updatedOffice).toBe(officeName + ' Edited');
    });

    test('Cannot edit office using invalid entries', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let officeName;

        if (rowsCount === 0) {
            console.log('No office found. Test skipped.');
            test.skip('No office found.');
        } else{
            officeName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateOfficeModal" ]');
        await expect(modal).toBeVisible();

        //fill-out form and click register button
        await modal.locator('input[name="office_location"]').fill('');
        await modal.locator('input[name="office_location"]').fill('!@#$%^');
        await modal.locator('input[name="swado"]').fill('');
        await modal.locator('input[name="swado"]').fill('!@#$%^');
        await modal.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
        await expect(await rows.nth(0).locator('td:nth-child(1)').innerText()).toBe(officeName);
    });

    test('Cannot edit office if one or more reqiuired fields are empty', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let officeName;

        if (rowsCount === 0) {
            console.log('No office found. Test skipped.');
            test.skip('No office found.');
        } else{
            officeName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateOfficeModal" ]');
        await expect(modal).toBeVisible();

        //fill-out form and click register button
        await modal.locator('input[name="office_location"]').fill('');
        await modal.locator('input[name="swado"]').fill('');
        await modal.getByRole('button', { name: 'Update' }).click();

        const input = await page.getByRole('textbox', { name: 'Office Location (Municipality/City only)' });

        const message = await input.evaluate((el, HTMLInputElement) => el.validationMessage);
        expect(message).toBe('Please fill out this field.');
    });

    test('Change status of an office from active to inactive.', async ({ page }) => {
        const rows = await page.locator('table tbody tr', { hasText: 'Active' }).first();
        let officeName;

        if (!rows) {
            console.log('No active office found. Test skipped.');
            test.skip('No active office found.');
        } else{
            officeName = await rows.locator('td:nth-child(1)').innerText();
        }

        await rows.locator('td:nth-child(5)').click();
        
        const modal = page.locator('div[ x-show="updateOfficeModal" ]');
        await expect(modal).toBeVisible();

        //status to inactive
        await modal.locator('xpath=//*[@id="status"]').selectOption({ label: 'Inactive' });
        await modal.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 3000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/updated successfully/i);

        //office should not be listed when allocating CA
        await page.locator('xpath=/html/body/div/aside/nav/div[2]/button/span').click();
        await page.getByRole('link', { name: 'List' }).click();
        await expect(page.getByRole('heading', { name: 'Cash Advances List', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/cash-advances/list');

        const caRows= await page.locator('table tbody tr', { hasText: 'Unliquidated' }).first();
        await caRows.locator('td:nth-child(7)').click();

        const allocateModal = page.locator('div[ x-show="allocateFundModal" ]');
        await expect(allocateModal).toBeVisible();

        // Locate the dropdown inside the allocate modal
        const officeDropdown = allocateModal.locator('//div[4]/div[3]/div/div/form//select[@name="office_id"]');

        // Check that the dropdown is visible
        await expect(officeDropdown).toBeVisible();

        // Assert that inactive office is not in the dropdown options
        await expect(officeDropdown).not.toContainText(officeName);
    });

    test('Change status of an office from inactive to active.', async ({ page }) => {
        const rows = await page.locator('table tbody tr', { hasText: 'Inactive' }).first();
        let officeName;

        if (!rows) {
            console.log('No inactive office found. Test skipped.');
            test.skip('No office found.');
        } else{
            officeName = await rows.locator('td:nth-child(1)').innerText();
        }

        await rows.locator('td:nth-child(5)').click();
        
        const modal = page.locator('div[ x-show="updateOfficeModal" ]');
        await expect(modal).toBeVisible();

        //status to inactive
        await modal.locator('xpath=//*[@id="status"]').selectOption({ label: 'Active' });
        await modal.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 3000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/updated successfully/i);

        //office should not be listed when allocating CA
        await page.locator('xpath=/html/body/div/aside/nav/div[2]/button/span').click();
        await page.getByRole('link', { name: 'List' }).click();
        await expect(page.getByRole('heading', { name: 'Cash Advances List', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/cash-advances/list');

        const caRows= await page.locator('table tbody tr', { hasText: 'Unliquidated' }).first();
        await caRows.locator('td:nth-child(7)').click();

        const allocateModal = page.locator('div[ x-show="allocateFundModal" ]');
        await expect(allocateModal).toBeVisible();

        // Locate the dropdown inside the allocate modal
        const officeDropdown = allocateModal.locator('//div[4]/div[3]/div/div/form//select[@name="office_id"]');

        // Check that the dropdown is visible
        await expect(officeDropdown).toBeVisible();

        // Assert that inactive office is not in the dropdown options
        await expect(officeDropdown).toContainText(officeName);
    });

    test ('Delete office with related CA', async ({ page }) => {
        await page.locator('xpath=/html/body/div/aside/nav/div[2]/button/span').click();
        await page.getByRole('link', { name: 'List' }).click();
        await expect(page.getByRole('heading', { name: 'Cash Advances List', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/cash-advances/list');

        await page.getByRole('button', { name: 'Unliquidated', exact: true }).click();

        const caRows = await page.locator('table tbody tr');
        const caRowsCount  = await caRows.count();
        let programName;

        if (caRowsCount == 0){
            console.log('No cash advances found. Test skipped.');
            test.skip('No cash advance found.');
        } else {
            programName = await caRows.nth(0).locator('td:nth-child(4)').innerText();
        }

        await page.getByRole('link', { name: 'Programs' }).click();
        await expect(page.getByRole('heading', { name: 'Programs', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/program');

        await page.getByPlaceholder('Search...').fill(programName);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');

        const deleteBtn = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div[2]/button');
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        const modal = page.locator('div[ x-show="deleteProgramModal" ]');
        await expect(modal).toBeVisible();

        await modal.getByRole('button', { name: 'Delete' }).click();

        const prompt = await page.locator('xpath=//*[@id="swal2-html-container"]');
        await expect(prompt).toHaveText(/Cannot delete this program because it has related Cash Advances./);

        await page.getByRole('button', { name: 'OK' }).click();
    });

    test('Can navigate between pages', async ({ page }) => {
        const totalPages = await page.locator('span[x-text="programTotalPages"]').textContent();

        const nextButton = page.getByRole('button', { name: 'Next »' });
        const prevButton = page.getByRole('button', { name: '« Prev' });
        await expect(nextButton).toBeVisible();

        const isEnabled = await nextButton.isEnabled();

        if (isEnabled) {
            console.log('Next button is enabled — clicking it.');
            await nextButton.click();
            await expect(await page.locator('span[x-text="programCurrentPage"]').textContent()).toBe('2');

            await prevButton.click();
            await expect(await page.locator('span[x-text="programCurrentPage"]').textContent()).toBe('1');
        } else {
            console.log('Next button is disabled — skipping test.');
            test.skip('Next button is disabled, skipping this test.');
        }
    });
});