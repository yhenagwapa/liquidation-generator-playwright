// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe.serial('Programs Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://172.26.120.49/liquidation-generator/public/');

        await page.getByLabel('Email').fill('test@gmail.com');
        await page.getByLabel('Password').fill('Dswd@12345');
        await page.getByRole('button', { name: 'Log in' }).click();

        await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
        
        await page.getByRole('link', { name: 'Programs' }).click();
        await expect(page.getByRole('heading', { name: 'Programs', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/program');
    });

    test('Can add program using valid entries', async ({ page }) => {
        //fill-out form and click register button
        await page.getByLabel('Program Name').fill('Social Pension');
        await page.getByLabel('Program Abbreviation').fill('SocPen');
        await page.getByLabel('Origin Office').fill('Social Pension Program');
        await page.getByRole('button', { name: 'Register' }).click();

        // Wait for alert to appear
        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 10000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/program registered successfully/i);

        // Wait for it to disappear (whether hidden or removed)
        await expect(alert).toBeHidden({ timeout: 10000 });

    });

    test('Cannot add program using invalid entries', async ({ page }) => {
        //fill-out form and click register button
        await page.getByLabel('Program Name').fill('!@#$%^');
        await page.getByLabel('Program Abbreviation').fill('!@#$%^');
        await page.getByLabel('Origin Office').fill('!@#$%^');

        await page.locator('span:has-text("Only letters, numbers, dots, dashes, slashes, and spaces are allowed.")');
        await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
    });

    test('Cannot add program if required field/s are empty', async ({ page }) => {
        //fill-out form and click register button
        await page.getByLabel('Program Abbreviation').fill('Test');
        await page.getByLabel('Origin Office').fill('Test Office');
        await page.getByRole('button', { name: 'Register' }).click();

        const input = await page.getByRole('textbox', { name: 'Program Name' })

        const message = await input.evaluate((el, HTMLInputElement) => el.validationMessage);
        expect(message).toBe('Please fill out this field.'); 
    });

    test('Cannot add program if all fields are empty', async ({ page }) => {
        await page.getByRole('button', { name: 'Register' }).click();

        const input = await page.getByRole('textbox', { name: 'Program Name' });

        const message = await input.evaluate((el, HTMLInputElement) => el.validationMessage);
        expect(message).toBe('Please fill out this field.'); 
    });

    test('Cannot add program if duplicate entry', async ({ page }) => {
        await page.waitForSelector('table tbody tr');
        const row = page.locator('table tbody tr').nth(1);

        const programName = await row.locator('td').nth(0).innerText();
        const programAbbreviation = await row.locator('td').nth(1).innerText();
        const originOffice = await row.locator('td').nth(2).innerText();

        await page.getByLabel('Program Name').fill(programName);
        await page.getByLabel('Program Abbreviation').fill(programAbbreviation);
        await page.getByLabel('Origin Office').fill(originOffice);
        await page.getByRole('button', { name: 'Register' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
    });

    test('Displays result if exact match is searched', async ({ page }) => {
        const keyword = 'Emergency Cash Transfer';

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
        const keyword = 'AKA';

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
        const keyword = 'AICS';

        await page.getByPlaceholder('Search...').fill(keyword);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if(rowsCount > 0){
            for (let i = 0; i < rowsCount - 1; i++){
                const firstRowResult = await rows.nth(i).locator('td:nth-child(2)').innerText();

                if(expect(firstRowResult).toBe('No SDOs found.')){
                    break;
                }
            }
        }
    });

    test('Can open edit modal', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let programName;

        if (rowsCount === 0) {
            console.log('No cash program found. Test skipped.');
            test.skip('No cash program found.');
        } else{
            programName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateProgramModal" ]');
        await expect(modal).toBeVisible();

        const program = await modal.locator('#program_name').inputValue();

        await expect(program).toBe(programName);
    });

    test('Can edit program using valid entries', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let programName;

        if (rowsCount === 0) {
            console.log('No cash program found. Test skipped.');
            test.skip('No cash program found.');
        } else{
            programName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateProgramModal" ]');
        await expect(modal).toBeVisible();

        //fill-out form and click register button
        await modal.getByLabel('Program Name').fill(' Edited');
        await modal.getByLabel('Program Abbreviation').fill(' Edited');
        await modal.getByLabel('Origin Office').fill(' Edited');
        await modal.getByRole('button', { name: 'Update Program' }).click();

        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 10000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/program updated successfully/i);

        // Wait for it to disappear (whether hidden or removed)
        await expect(alert).toBeHidden({ timeout: 10000 });

        const updatedProgram = await rows.nth(0).locator('td:nth-child(1)').innerText();

        await expect(updatedProgram).toBe(programName + ' Edited');
    });

    test('Cannot edit program using invalid entries', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let programName;

        if (rowsCount === 0) {
            console.log('No cash program found. Test skipped.');
            test.skip('No cash program found.');
        } else{
            programName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateProgramModal" ]');
        await expect(modal).toBeVisible();

        //fill-out form and click register button
        await modal.getByLabel('Program Name').fill('');
        await modal.getByLabel('Program Name').fill('!@#$%^');
        await modal.getByLabel('Program Abbreviation').fill('');
        await modal.getByLabel('Program Abbreviation').fill('!@#$%^');
        await modal.getByLabel('Origin Office').fill('');
        await modal.getByLabel('Origin Office').fill('!@#$%^');
        await modal.getByRole('button', { name: 'Update Program' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
        await expect(await rows.nth(0).locator('td:nth-child(1)').innerText()).toBe(programName);
    });

    test('Cannot edit program if one or more reqiuired fields are empty', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let programName;

        if (rowsCount === 0) {
            console.log('No cash program found. Test skipped.');
            test.skip('No cash program found.');
        } else{
            programName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateProgramModal" ]');
        await expect(modal).toBeVisible();

        //fill-out form and click register button
        await modal.getByLabel('Program Name').fill('');
        await modal.getByLabel('Program Abbreviation').fill('');
        await modal.getByLabel('Origin Office').fill('');
        await modal.getByRole('button', { name: 'Update Program' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
        await expect(await rows.nth(0).locator('td:nth-child(1)').innerText()).toBe(programName);
    });

    test('Cannot edit program using duplicate entries', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let oldProgramName;
        let programName;
        let programAbbreviation;
        let originOffice;

        if (rowsCount === 0) {
            console.log('No program found. Test skipped.');
            test.skip('No program found.');
        } else if (rowsCount === 1) {
            console.log('Program found with one entry. Test skipped.');
            test.skip('Program found with one entry.');
        } else {
            oldProgramName = await rows.nth(0).locator('td:nth-child(1)').innerText();

            programName = await rows.nth(1).locator('td:nth-child(1)').innerText();
            programAbbreviation = await rows.nth(1).locator('td:nth-child(2)').innerText();
            originOffice = await rows.nth(1).locator('td:nth-child(3)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[2]/td[5]/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateProgramModal" ]');
        await expect(modal).toBeVisible();

        //fill-out form and click register button
        await modal.getByLabel('Program Name').fill('');
        await modal.getByLabel('Program Name').fill(programName);
        await modal.getByLabel('Program Abbreviation').fill('');
        await modal.getByLabel('Program Abbreviation').fill(programAbbreviation);
        await modal.getByLabel('Origin Office').fill('');
        await modal.getByLabel('Origin Office').fill(originOffice);
        await modal.getByRole('button', { name: 'Update Program' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
        await expect(await row.nth(0).locator('td:nth-child(1)').innerText()).toBe(oldProgramName);
    });

    test('Change status of a program from active to inactive and vice versa.', async ({ page }) => {
        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();
        let programName;

        if (rowsCount === 0) {
            console.log('No cash program found. Test skipped.');
            test.skip('No cash program found.');
        } else{
            programName = await rows.nth(0).locator('td:nth-child(1)').innerText();
        }

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[5]/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();
        
        const modal = page.locator('div[ x-show="updateProgramModal" ]');
        await expect(modal).toBeVisible();

        //status to inactive
        await modal.locator('xpath=//*[@id="status"]').selectOption({ label: 'Inactive' });
        await modal.getByRole('button', { name: 'Update Program' }).click();

        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 10000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/program updated successfully/i);

        // Wait for it to disappear (whether hidden or removed)
        await expect(alert).toBeHidden({ timeout: 10000 });

        //program should not be listed when adding cash advance
        await page.locator('xpath=/html/body/div/aside/nav/div[2]/button/span').click();
        await page.getByRole('link', { name: 'Add' }).click();
        await expect(page.getByRole('heading', { name: 'Add Cash Advances', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/cash-advances/add');

        //click program dropdown and look for the inactivated program
        await page.locator('xpath=//*[@id="program_id"]').click();
        const programOption = page.getByText(programName, { exact: true });
        await expect(programOption).not.toBeVisible();
    });

    test ('Delete program with related CA', async ({ page }) => {
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

        await page.getByRole('link', { name: 'Programss' }).click();
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
        const totalPages = await page.locator('span[x-text="sdoTotalPages"]').textContent();

        const nextButton = page.getByRole('button', { name: 'Next »' });
        const prevButton = page.getByRole('button', { name: '« Prev' });
        await expect(nextButton).toBeVisible();

        const isEnabled = await nextButton.isEnabled();

        if (isEnabled) {
            console.log('Next button is enabled — clicking it.');
            await nextButton.click();
            await expect(await page.locator('span[x-text="currentPage"]').textContent()).toBe('2');

            await prevButton.click();
            await expect(await page.locator('span[x-text="currentPage"]').textContent()).toBe('1');
        } else {
            console.log('Next button is disabled — skipping test.');
            test.skip('Next button is disabled, skipping this test.');
        }
    });
});