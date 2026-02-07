const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
    const timestamp = Date.now();
    const userName = `E2E User ${timestamp}`;
    const userEmail = `e2e_${timestamp}@test.com`;
    const userPassword = 'Password123!';

    test('should allow a user to register and then login', async ({ page }) => {
        // 1. Go to Registration Page
        await page.goto('/register');
        await expect(page).toHaveTitle(/PostCreator/);

        // 2. Fill registration form
        await page.fill('input[placeholder="John Doe"]', userName);
        await page.fill('input[type="email"]', userEmail);
        await page.fill('input[type="password"]', userPassword);
        await page.click('button[type="submit"]');

        // 3. Should be redirected to Dashboard
        await expect(page).toHaveURL('/');
        await expect(page.locator('h2')).toContainText('Connect your account');

        // 4. Logout
        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL('/login');

        // 5. Login back
        await page.fill('input[type="email"]', userEmail);
        await page.fill('input[type="password"]', userPassword);
        await page.click('button[type="submit"]');

        // 6. Verify Login successful
        await expect(page).toHaveURL('/');
        await expect(page.locator('.user-name')).toContainText(userName);
    });
});
