// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe.serial('SDOs Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://172.26.120.49/liquidation-generator/public/');

        await page.getByLabel('Email').fill('test@gmail.com');
        await page.getByLabel('Password').fill('Dswd@12345');
        await page.getByRole('button', { name: 'Log in' }).click();

        await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
        
        await page.getByRole('link', { name: 'SDOs' }).click();
        await expect(page.getByRole('heading', { name: 'Special Disbursing Officers', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/sdo');
    });
    
    //function for generating random employee ID
    function generateEmployeeID() {
        const part1 = Math.floor(Math.random() * 90 + 10);     // two digits (10–99)
        const part2 = Math.floor(Math.random() * 9000 + 1000); // four digits (1000–9999)
        return `${part1}-${part2}`;
    }

    test('Can add special disbursing officers using valid entries', async ({ page }) => {
        //generate employee ID
        const employeeID = generateEmployeeID();

        //fill-out form and click register button
        await page.getByLabel('Employee ID Number').fill(employeeID);
        await page.getByLabel('Firstname').fill('Lorela');
        await page.getByLabel('Middlename').fill('M');
        await page.getByLabel('Lastname').fill('Ramos');
        await page.getByLabel('Position').fill('SWO V');
        await page.getByLabel('Designation').fill('Division Chief');
        await page.getByLabel('Station').fill('Standards');
        await page.getByRole('button', { name: 'Register' }).click();

        // Wait for alert to appear
        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 10000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/added successfully/i);

        // Wait for it to disappear (whether hidden or removed)
        await expect(alert).toBeHidden({ timeout: 10000 });

    });

    test('Cannot add special disbursing officers using invalid entries', async ({ page }) => {
        await page.getByLabel('Employee ID Number').fill('ABCDEF');
        await page.getByLabel('Firstname').fill('!@#$%^');
        await page.getByLabel('Middlename').fill('!@#$%^');
        await page.getByLabel('Lastname').fill('!@#$%^');
        await page.getByLabel('Position').fill('!@#$%^');
        await page.getByLabel('Designation').fill('!@#$%^');
        await page.getByLabel('Station').fill('!@#$%^');

        await page.locator('span:has-text("Only numbers and dashes are allowed.")');
        await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
    });

    test('Cannot add special disbursing officers if required field/s are empty', async ({ page }) => {
        await page.getByLabel('Firstname').fill('Juan');
        await page.getByLabel('Middlename').fill('Luna');
        await page.getByLabel('Lastname').fill('Delos Santos');
        await page.getByLabel('Position').fill('AO IV');
        await page.getByLabel('Designation').fill('OIC');
        await page.getByLabel('Station').fill('HA');

        await page.getByRole('button', { name: 'Register' }).click();

        const input = await page.getByRole('textbox', { name: 'Employee ID Number' })

        const message = await input.evaluate((el, HTMLInputElement) => el.validationMessage);
        expect(message).toBe('Please fill out this field.'); 
    });

    test('Cannot add special disbursing officers if all fields are empty', async ({ page }) => {
        await page.getByRole('button', { name: 'Register' }).click();

        const input = await page.getByRole('textbox', { name: 'Employee ID Number' });

        const message = await input.evaluate((el, HTMLInputElement) => el.validationMessage);
        expect(message).toBe('Please fill out this field.'); 
    });

    test('Cannot add special disbursing officers using duplicate entry', async ({ page }) => {

        await page.waitForSelector('table tbody tr');
        const row = page.locator('table tbody tr').nth(1);

        const employeeID = await row.locator('td').nth(0).innerText();
        const position = await row.locator('td').nth(2).innerText();
        const designation = await row.locator('td').nth(3).innerText();
        const station = await row.locator('td').nth(4).innerText();

        await page.getByLabel('Employee ID Number').fill(employeeID);
        await page.getByLabel('Firstname').fill('Lorela');
        await page.getByLabel('Middlename').fill('M');
        await page.getByLabel('Lastname').fill('Ramos');
        await page.getByLabel('Position').fill(position);
        await page.getByLabel('Designation').fill(designation);
        await page.getByLabel('Station').fill(station);
        await page.getByRole('button', { name: 'Register' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
    });

    test('Displays result if exact match is searched', async ({ page }) => {
        const keyword = 'Lorela M Ramos';

        await page.getByPlaceholder('Search...').fill(keyword);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if(rowsCount > 0){
            for (let i = 0; i < rowsCount - 1; i++){
                const firstRowResult = await rows.nth(i).locator('td:nth-child(2)').innerText();

                if(expect(firstRowResult).toBe(keyword)){
                    break;
                }
            }
        }
    });

    test('Displays result if partial match is searched', async ({ page }) => {
        const keyword = 'App';

        await page.getByPlaceholder('Search...').fill(keyword);
        await page.keyboard.press('Enter');

        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if(rowsCount > 0){
            for (let i = 0; i < rowsCount - 1; i++){
                const firstRowResult = await rows.nth(i).locator('td:nth-child(2)').innerText();

                expect(firstRowResult.includes(keyword));
            }
        }
    });

    test('Displays result if no match is searched', async ({ page }) => {
        const keyword = 'Mark';

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

    test('Is redirected to CDR page', async ({ page }) => {

        const button = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[7]/div/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if (rowsCount === 0) {
            test.skip('No cash advance found.');
        }

        const sdoname = await rows.nth(0).locator('td:nth-child(2)').innerText();
        
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'),
            page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[7]/div/div[1]/button').click(),
        ]);

        await newPage.waitForLoadState('load', { timeout: 60000 });
        await expect(newPage).toHaveURL(/cdr/, { timeout: 60000 });
        await expect(newPage.getByRole('heading', { name: 'CASH DISBURSEMENT RECORD', exact: true })).toBeVisible();
        await expect(newPage.locator('xpath=/html/body/div/div/div[2]/div[5]/table/thead/tr[1]/th[1]', { name: sdoname, exact: true })).toBeVisible();
    });

    test('Can open edit modal', async ({ page }) => {

        const button = await page.locator('xpath=/html/body/div/div/nav/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if (rowsCount === 0) {
            test.skip('No cash advance found.');
        }

        const idNumber = await rows.nth(0).locator('td:nth-child(1)').innerText();

        await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[7]/div/div[2]/button').click();

        const modal = page.locator('div[ x-show="updateSdoModal" ]');
        await expect(modal).toBeVisible();

        const employeeID = await modal.locator('#id_number').inputValue();

        await expect(employeeID).toBe(idNumber);
    });

    test('Can edit SDO using valid entries', async ({ page }) => {

        const button = await page.locator('xpath=/html/body/div/div/nav/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if (rowsCount === 0) {
            test.skip('No cash advance found.');
        }

        await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[7]/div/div[2]/button').click();

        const modal = page.locator('div[ x-show="updateSdoModal" ]');
        await expect(modal).toBeVisible();

        const newSdoID = generateEmployeeID();

        await modal.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill(newSdoID);
        await modal.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('Sample Edit');
        await modal.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('Sample Edit');
        await modal.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('Sample Edit');
        await modal.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('Sample Edit');
        await modal.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('Sample Edit');
        await modal.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible({ timeout: 10000 });

        // Assert the alert text (partial match, case-insensitive)
        await expect(alert).toHaveText(/sdo updated successfully/i);

        // Wait for it to disappear (whether hidden or removed)
        await expect(alert).toBeHidden({ timeout: 10000 });

        const updatedSdoID = await rows.nth(0).locator('td:nth-child(1)').innerText();

        await expect(updatedSdoID).toBe(newSdoID);
    });

    test('Cannot edit SDO using invalid entries', async ({ page }) => {

        const button = await page.locator('xpath=/html/body/div/div/nav/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if (rowsCount === 0) {
            test.skip('No cash advance found.');
        }

        await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[7]/div/div[2]/button').click();

        const modal = page.locator('div[ x-show="updateSdoModal" ]');
        await expect(modal).toBeVisible();

        const oldID = await rows.nth(0).locator('td:nth-child(1)').innerText();
        const newSdoID = '!@#$%^';

        await modal.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill(newSdoID);
        await modal.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('!@#$%^');
        await modal.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('!@#$%^');
        await modal.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('!@#$%^');
        await modal.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('!@#$%^');
        await modal.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('!@#$%^');
        await modal.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
        await expect(await rows.nth(0).locator('td:nth-child(1)').innerText()).toBe(oldID);
    });

    test('Cannot edit SDO if one or more reqiuired fields are empty', async ({ page }) => {

        const button = await page.locator('xpath=/html/body/div/div/nav/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if (rowsCount === 0) {
            test.skip('No cash advance found.');
        }

        await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[7]/div/div[2]/button').click();

        const modal = page.locator('div[ x-show="updateSdoModal" ]');
        await expect(modal).toBeVisible();

        const currentID = await rows.nth(0).locator('td:nth-child(1)').innerText();

        await modal.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('');
        await modal.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
        await expect(await rows.nth(0).locator('td:nth-child(1)').innerText()).toBe(currentID);
    });

    test('Cannot edit SDO using duplicate entries', async ({ page }) => {
        const button = await page.locator('xpath=/html/body/div/div/nav/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if (rowsCount === 0) {
            test.skip('No cash advance found.');
        }

        await page.waitForSelector('table tbody tr');
        const row = page.locator('table tbody tr').nth(1);
        const idNumber = await row.locator('td:nth-child(1)').innerText();
        const firstName = await row.locator('td:nth-child(2)').innerText();
        const lastName = await row.locator('td:nth-child(3)').innerText();
        const position = await row.locator('td:nth-child(4)').innerText();
        const station = await row.locator('td:nth-child(5)').innerText();
        const designation = await row.locator('td:nth-child(6)').innerText();

        await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[7]/div/div[2]/button').click();

        const modal = page.locator('div[ x-show="updateSdoModal" ]');
        await expect(modal).toBeVisible();

        await modal.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill(idNumber);
        await modal.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('Sample Edit');
        await modal.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('Sample Edit');
        await modal.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.position"]').fill(position);
        await modal.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.station"]').fill(station);
        await modal.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('');
        await modal.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill(designation);
        await modal.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
        await expect(await row.nth(0).locator('td:nth-child(1)').innerText()).toBe(idNumber);
    });

    test ('Delete SDO with unliquidated CA', async ({ page }) => {
        await page.locator('xpath=/html/body/div/aside/nav/div[2]/button/span').click();
        await page.getByRole('link', { name: 'List' }).click();
        await expect(page.getByRole('heading', { name: 'Cash Advances List', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/cash-advances/list');

        await page.getByRole('button', { name: 'Unliquidated', exact: true }).click();

        const caRows = await page.locator('table tbody tr');
        const caRowsCount  = await caRows.count();
        let SDOname;

        if (caRowsCount == 0){
            console.log('No unliquidated cash advances.');
            test.skip('No cash advance found.');
        } else {
            SDOname = await caRows.nth(0).locator('td:nth-child(1)').innerText();
        }

        await page.getByRole('link', { name: 'SDOs' }).click();
        await expect(page.getByRole('heading', { name: 'Special Disbursing Officers', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/sdo');

        await page.getByPlaceholder('Search...').fill(SDOname);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');

        const deleteBtn = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr/td[7]/div/div[3]/button');
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        const modal = page.locator('div[ x-show="deleteSdoModal" ]');
        await expect(modal).toBeVisible();

        await modal.getByRole('button', { name: 'Delete' }).click();

        const prompt = await page.locator('xpath=//*[@id="swal2-html-container"]');
        await expect(prompt).toHaveText(/Cannot delete this SDO because it has related Cash Advances./);

        await page.getByRole('button', { name: 'OK' }).click();
    });

    test ('Delete SDO with liquidated CA', async ({ page }) => {
        await page.locator('xpath=/html/body/div/aside/nav/div[2]/button/span').click();
        await page.getByRole('link', { name: 'List' }).click();
        await expect(page.getByRole('heading', { name: 'Cash Advances List', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/cash-advances/list');

        await page.getByRole('button', { name: 'Liquidated', exact: true }).click();

        const caRows = await page.locator('table tbody tr');
        const caRowsCount  = await caRows.count();
        let SDOname;

        if (caRowsCount == 0){
            console.log('No unliquidated cash advances.');
            test.skip('No cash advance found.');
        } else {
            SDOname = await caRows.nth(0).locator('td:nth-child(1)').innerText();
        }

        await page.getByRole('link', { name: 'SDOs' }).click();
        await expect(page.getByRole('heading', { name: 'Special Disbursing Officers', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/sdo');

        await page.getByPlaceholder('Search...').fill(SDOname);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        const rows = await page.locator('table tbody tr');

        const deleteBtn = await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr/td[7]/div/div[3]/button');
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        const modal = page.locator('div[ x-show="deleteSdoModal" ]');
        await expect(modal).toBeVisible();

        await modal.getByRole('button', { name: 'Delete' }).click();

        const prompt = await page.locator('xpath=//*[@id="swal2-html-container"]');
        await expect(prompt).toHaveText(/Cannot delete this SDO because it has related Cash Advances./);

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