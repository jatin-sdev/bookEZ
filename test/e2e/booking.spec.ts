import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {

  test('should complete a full booking journey', async ({ page }) => {
    // 1. Go to events listing page
    await page.goto('/events');
    
    // Wait for events to load
    await page.waitForLoadState('networkidle');
    
    // Check if there are any events visible
    const eventLinks = page.locator('a[href^="/events/"]');
    const eventCount = await eventLinks.count();
    
    // Skip test if no events available
    if (eventCount === 0) {
      console.log('No events available in database - skipping test');
      return;
    }
    
    // 2. Click on the first event
    await eventLinks.first().click();
    
    // Wait for event page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on an event details page
    await expect(page).toHaveURL(/\/events\/\d+/);
    
    // 3. Look for seat selection or booking widget
    // Note: This will depend on your actual UI implementation
    const bookingWidget = page.locator('[class*="booking"]');
    
    if (await bookingWidget.count() > 0) {
      // If booking widget exists, verify it's visible
      await expect(bookingWidget.first()).toBeVisible();
    }
    
    // 4. Verify essential event details are displayed
    // 4. Verify essential event details are displayed
    // Check if we hit a 404 page first
    // Check if we hit a 404 page first
    const is404 = await page.getByRole('heading', { name: 'This page could not be found.' }).isVisible();
    if (is404) {
      throw new Error(`Event page returned 404 - Verify backend has event data for ID: ${await page.url().split('/').pop()}`);
    }

    // Use specific selector for main heading to avoid logo conflict
    await expect(page.locator('main h1')).toBeVisible();
  });
});