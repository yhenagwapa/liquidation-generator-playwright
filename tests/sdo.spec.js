// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('SDOs Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://172.31.176.49/liquidation-generator/public/');

        await page.getByLabel('Email').fill('test@gmail.com');
        await page.getByLabel('Password').fill('Dswd@12345');
        await page.getByRole('button', { name: 'Log in' }).click();

        await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
        
        await page.getByRole('link', { name: 'SDOs' }).click();
        await expect(page.getByRole('heading', { name: 'Special Disbursing Officers', exact: true })).toBeVisible();
        await expect(page.url()).toContain('/sdo');
    });

    test('Can add special disbursing officers using valid entries', async ({ page }) => {
        await page.getByLabel('Employee ID Number').fill('11-1111');
        await page.getByLabel('Firstname').fill('Lorela');
        await page.getByLabel('Middlename').fill('M');
        await page.getByLabel('Lastname').fill('Ramos');
        await page.getByLabel('Position').fill('Division Chief');
        await page.getByLabel('Station').fill('Standards');
        await page.getByRole('button', { name: 'Register' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText('Added Successfully');
        await expect(alert).toBeHidden({ timeout: 4000 });
    });

    test('Cannot add special disbursing officers using invalid entries', async ({ page }) => {
        await page.getByLabel('Employee ID Number').fill('ABCDEF');
        await page.getByLabel('Firstname').fill('!@#$%^');
        await page.getByLabel('Middlename').fill('!@#$%^');
        await page.getByLabel('Lastname').fill('!@#$%^');
        await page.getByLabel('Position').fill('!@#$%^');
        await page.getByLabel('Station').fill('!@#$%^');

        await page.locator('span:has-text("Only numbers and dashes are allowed.")');
        await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
    });

    test('Cannot add special disbursing officers if required field/s are empty', async ({ page }) => {
        await page.getByLabel('Firstname').fill('Juan');
        await page.getByLabel('Middlename').fill('Luna');
        await page.getByLabel('Lastname').fill('Delos Santos');
        await page.getByLabel('Position').fill('OIC');
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
        await page.getByLabel('Employee ID Number').fill('333333');
        await page.getByLabel('Firstname').fill('MARK REZZEL');
        await page.getByLabel('Lastname').fill('SARABIA');
        await page.getByLabel('Position').fill('ITO III');
        await page.getByLabel('Designation').fill('OIC');
        await page.getByLabel('Station').fill('RICTMS');
        await page.getByRole('button', { name: 'Register' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
    });

    test('Displays result if exact match is searched', async ({ page }) => {
        const keyword = 'Peter Paul Villaluna';

        await page.getByPlaceholder('Search...').fill(keyword);
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
        const keyword = 'Mark';

        await page.getByPlaceholder('Search...').fill(keyword);
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
        const keyword = 'Apple';

        await page.getByPlaceholder('Search...').fill(keyword);
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

        const button = await page.locator('xpath=/html/body/div/div/nav/div[1]/button');
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

        const employeeID = await page.getByLabel('Employee ID Number').innerText();

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

        const newSdoID = '111000';

        await page.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill(newSdoID);
        await page.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('Sample Edit');
        await page.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('Sample Edit');
        await page.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('Sample Edit');
        await page.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('Sample Edit');
        await page.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('Sample Edit');
        await page.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText('Added Successfully');
        await expect(alert).toBeHidden({ timeout: 4000 });

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

        await page.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill(newSdoID);
        await page.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('!@#$%^');
        await page.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('!@#$%^');
        await page.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('!@#$%^');
        await page.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('!@#$%^');
        await page.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('!@#$%^');
        await page.getByRole('button', { name: 'Update' }).click();

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

        await page.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('');
        await page.getByRole('button', { name: 'Update' }).click();

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

        await page.locator('xpath=/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[1]/td[7]/div/div[2]/button').click();

        const modal = page.locator('div[ x-show="updateSdoModal" ]');
        await expect(modal).toBeVisible();

        const currentID = await rows.nth(0).locator('td:nth-child(1)').innerText();

        await page.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.id_number"]').fill('444444');
        await page.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.firstname"]').fill('Peter Paul');
        await page.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.lastname"]').fill('Villaluna');
        await page.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.position"]').fill('SWO IV');
        await page.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.station"]').fill('PPD');
        await page.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('');
        await page.locator('[x-bind\\:value="sdoToUpdate.designation"]').fill('Unit Head');
        await page.getByRole('button', { name: 'Update' }).click();

        const alert = page.getByRole('alert');
        await alert.waitFor({ state: 'visible', timeout: 5000 });
        await expect(alert).toHaveText(/There were some issues with your submission:/);
        await expect(await rows.nth(0).locator('td:nth-child(1)').innerText()).toBe(currentID);
    });

    test ('Delete SDO with unliquidated CA', async ({ page }) => {
        const button = await page.locator('xpath=/html/body/div/div/nav/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if (rowsCount === 0) {
            test.skip('No cash advance found.');
        }

        await page.locator('/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[2]/td[7]/div/div[3]/button').click();

        const modal = page.locator('div[ x-show="deleteSdoModal" ]');
        await expect(modal).toBeVisible();

        await page.getByRole('button', { name: 'Delete' }).click();

        const prompt = await page.locator('.swal2-popup.swal2-modal.swal2-icon-error.swal2-show').toBeVisible();

        await expect(prompt.innerText()).toBE('Cannot delete this SDO because it has related Cash Advances.');

        await page.getByRole('button', { name: 'OK' }).click();
    });

    test ('Delete SDO with liquidated CA', async ({ page }) => {
        const button = await page.locator('xpath=/html/body/div/div/nav/div[1]/button');
        await expect(button).toBeVisible();
        await button.click();

        const rows = await page.locator('table tbody tr');
        const rowsCount  = await rows.count();

        if (rowsCount === 0) {
            test.skip('No cash advance found.');
        }

        await page.locator('/html/body/div/div/main/div[2]/div[2]/div/div[2]/div/div[2]/table/tbody/tr[2]/td[7]/div/div[3]/button').click();

        const modal = page.locator('div[ x-show="deleteSdoModal" ]');
        await expect(modal).toBeVisible();

        await page.getByRole('button', { name: 'Delete' }).click();

        const prompt = await page.locator('.swal2-popup.swal2-modal.swal2-icon-error.swal2-show').toBeVisible();

        await expect(prompt.innerText()).toBE('Cannot delete this SDO because it has related Cash Advances.');

        await page.getByRole('button', { name: 'OK' }).click();
    });

    test('Can navigate between pages', async ({ page }) => {
        
        const totalPages = await page.locator('span[x-text="sdoTotalPages"]');

        await expect(page.getByRole('button', { name: '« Prev' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Next »' })).toBeEnabled();
        await page.getByRole('button', { name: 'Next »' }).click( {timeout: 3000});
        
        await expect(page.getByRole('button', { name: '« Prev' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Next »' })).toBeDisabled();
        await page.getByRole('button', { name: '« Prev' }).click( {timeout: 3000});
        await expect(page.getByRole('button', { name: '« Prev' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Next »' })).toBeEnabled();
        
    });
});