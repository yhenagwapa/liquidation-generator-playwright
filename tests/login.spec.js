// @ts-check
import { test, expect } from '@playwright/test';


test('Has title Liquidation Generator', async ({ page }) => {
  await page.goto('https://172.31.176.49/liquidation-generator/public/');

  await expect(page).toHaveTitle(/Liquidation Generator/);
});

test('Can login using valid credentials', async ({ page }) => {
  await page.goto('https://172.31.176.49/liquidation-generator/public/');

  await page.getByLabel('Email').fill('test@gmail.com');
  await page.getByLabel('Password').fill('Dswd@12345');

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
});

test('Cannot login using invalid credentials', async ({ page }) => {
  await page.goto('https://172.31.176.49/liquidation-generator/public/');

  await page.getByLabel('Email').fill('some@email.com');
  await page.getByLabel('Password').fill('qwerty12345');

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('listitem').filter({ hasText: 'These credentials do not match our records.' })).toBeVisible({ timeout: 5000 });
  
});

test('Cannot login if email is empty', async ({ page }) => {
  await page.goto('https://172.31.176.49/liquidation-generator/public/');

  await page.getByLabel('Password').fill('dswd12345');
  await page.getByRole('button', { name: 'Log in' }).click();

  const input = page.locator('input[name="email"]');

  // @ts-ignore
  const message = await input.evaluate(el => el.validationMessage);
  expect(message).toBe('Please fill out this field.');

  await expect(page.url()).toBe('https://172.31.176.49/liquidation-generator/public/');
});

test('Cannot login if password is empty', async ({ page }) => {
  await page.goto('https://172.31.176.49/liquidation-generator/public/');

  await page.getByLabel('Email').fill('test@gmail.com');
  await page.getByRole('button', { name: 'Log in' }).click();

  const input = page.locator('input[name="password"]');

  // @ts-ignore
  const message = await input.evaluate(el => el.validationMessage);
  expect(message).toBe('Please fill out this field.');

  await expect(page.url()).toBe('https://172.31.176.49/liquidation-generator/public/');
});

test('Cannot login if email and password is empty', async ({ page }) => {
  await page.goto('https://172.31.176.49/liquidation-generator/public/');

  await page.getByRole('button', { name: 'Log in' }).click();

  const input = page.locator('input[name="email"]');

  // @ts-ignore
  const message = await input.evaluate(el => el.validationMessage);
  expect(message).toBe('Please fill out this field.');

  await expect(page.url()).toBe('https://172.31.176.49/liquidation-generator/public/');
});