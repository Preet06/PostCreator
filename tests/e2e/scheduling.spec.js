const { test, expect } = require('@playwright/test');

test.describe('Post Scheduling Flow', () => {
    let userEmail;
    const userPassword = 'Password123!';

    test.beforeAll(async () => {
        userEmail = `e2e_schedule_${Date.now()}@test.com`;
    });

    test('should allow a user to generate and schedule a post', async ({ page }) => {
        // 1. Register and Login (pre-requisite)
        await page.goto('/register');
        await page.fill('input[placeholder="John Doe"]', 'Scheduler User');
        await page.fill('input[type="email"]', userEmail);
        await page.fill('input[type="password"]', userPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');

        // 2. Go to Create Post
        await page.click('a[href="/create-post"]');
        await expect(page).toHaveURL('/create-post');

        // 3. Generate Variations
        await page.fill('textarea', 'Write a post about the future of AI agents in coding.');
        // We might need to wait for the button to be enabled if there's debouncing, 
        // but the UI usually allows clicking.
        await page.click('button:has-text("Generate Variations")');

        // 4. Wait for variations to appear
        const variationCard = page.locator('.variation-card').first();
        await expect(variationCard).toBeVisible({ timeout: 15000 });
        await variationCard.click();

        // 5. Click Schedule
        await page.click('button:has-text("Schedule Post")');

        // 6. Fill Scheduler (ConfirmModal should appear)
        const modal = page.locator('.glass-card'); // ConfirmModal has glass-card
        await expect(modal).toBeVisible();

        // The Scheduler is inside the modal
        // Date input should have value (default is today + 1h)
        await expect(page.locator('input[type="date"]')).toBeVisible();

        // 7. Click Confirm in Modal
        await page.click('button:has-text("Confirm Schedule")');

        // 8. Should be redirected to /posts or see success message
        await expect(page).toHaveURL('/posts');
        await expect(page.locator('table || .post-card || .recent-posts')).toContainText('Future of AI');
    });
});
