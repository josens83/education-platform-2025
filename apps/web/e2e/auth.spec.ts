import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Critical user flow: Login, Registration, Logout
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.locator('button[type="submit"]').click();

    // Check for validation messages
    await expect(page.locator('text=/email.*required/i')).toBeVisible();
    await expect(page.locator('text=/password.*required/i')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/(dashboard|home)/);

    // Should show user menu or profile
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login');

    // Click on sign up link
    await page.locator('text=/sign up|register|create account/i').click();

    // Should be on registration page
    await expect(page).toHaveURL(/\/(register|signup)/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect
    await page.waitForURL(/\/(dashboard|home)/);

    // Click logout
    await page.locator('[data-testid="user-menu"]').click();
    await page.locator('text=/logout|sign out/i').click();

    // Should redirect to login or home
    await expect(page).toHaveURL(/\/(login|\/)/);
  });
});
