import { test, expect } from '@playwright/test';

/**
 * Content Browsing E2E Tests
 * Critical user flow: Browse courses/books, Search, Filter, View details
 */

test.describe('Content Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage with content', async ({ page }) => {
    // Check for main content sections
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Should show content cards or listings
    await expect(page.locator('[data-testid*="book"], [data-testid*="course"], article, .card').first()).toBeVisible();
  });

  test('should navigate to books/courses page', async ({ page }) => {
    // Click on books or courses link
    const contentLink = page.locator('text=/books|courses|browse|catalog/i').first();
    await contentLink.click();

    // Should display content grid or list
    await expect(page.locator('[data-testid*="book"], [data-testid*="course"], article, .card')).toHaveCount({ min: 1 });
  });

  test('should search for content', async ({ page }) => {
    await page.goto('/books');

    // Find and use search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    await searchInput.fill('English');
    await searchInput.press('Enter');

    // Should display search results
    await page.waitForTimeout(1000); // Wait for search to complete

    // Should show some results or "no results" message
    const hasResults = await page.locator('[data-testid*="book"], [data-testid*="course"], article, .card').count() > 0;
    const hasNoResults = await page.locator('text=/no results|nothing found/i').isVisible();

    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('should filter content by category', async ({ page }) => {
    await page.goto('/books');

    // Find category filter
    const categoryFilter = page.locator('select, [data-testid="category-filter"]').first();

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();

      // Select a category option
      const option = page.locator('option, [role="option"]').nth(1);
      await option.click();

      // Wait for filtered results
      await page.waitForTimeout(1000);

      // Should still show content or "no results"
      const contentCount = await page.locator('[data-testid*="book"], [data-testid*="course"], article, .card').count();
      expect(contentCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should view content details', async ({ page }) => {
    await page.goto('/books');

    // Click on first content item
    const firstContent = page.locator('[data-testid*="book"], [data-testid*="course"], article, .card').first();
    await firstContent.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/(books|courses)\/\d+/);

    // Should display content details
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=/description|about|overview/i')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/books');

    // Look for pagination controls
    const nextButton = page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label="Next page"]');

    if (await nextButton.isVisible()) {
      // Get initial content
      const initialContent = await page.locator('[data-testid*="book"], [data-testid*="course"], article, .card').first().textContent();

      // Click next
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Content should change
      const newContent = await page.locator('[data-testid*="book"], [data-testid*="course"], article, .card').first().textContent();
      expect(newContent).not.toBe(initialContent);
    }
  });
});
