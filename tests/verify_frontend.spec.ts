
import { test, expect } from '@playwright/test';

test('verify frontend changes', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Capture screenshot of the main page
  await page.screenshot({ path: '/home/jules/verification/main_page.png' });

  // Click on the 'Switch Role' button
  await page.getByText('Switch Role').click();

  // Wait for navigation or content to update after role switch
  await page.waitForTimeout(1000);

  // Capture screenshot of the admin dashboard
  await page.screenshot({ path: '/home/jules/verification/analytics_dashboard.png' });

  // Verify that the analytics dashboard is displayed by checking the heading
  await expect(page.getByRole('heading', { name: 'Analytics Dashboard' })).toBeVisible();

  // Navigate to the Brand Rules section
  await page.getByText('Brand Guidelines').click();

  // Wait for the brand rules to load
  await page.waitForTimeout(1000);

  // Capture screenshot of the brand rules page
  await page.screenshot({ path: '/home/jules/verification/brand_guidelines.png' });

  // Verify that the brand rules are displayed
  await expect(page.getByText('Brand Identity & Strategy')).toBeVisible();
});
