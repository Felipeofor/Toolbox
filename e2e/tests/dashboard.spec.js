// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Dashboard tab', () => {
  test('renders KPIs, Data Quality and the View raw data CTA', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('tab', { name: /dashboard/i })).toHaveAttribute('aria-selected', 'true')

    // KPI cards
    await expect(page.getByText(/files listed/i)).toBeVisible()
    await expect(page.getByText(/parse success/i)).toBeVisible()

    // Data quality table
    await expect(page.getByText(/data quality/i)).toBeVisible()

    // CTA
    await expect(page.getByRole('button', { name: /view raw data/i })).toBeVisible()
  })

  test('switching to Files tab shows the table and search bar', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: /files/i }).click()

    await expect(page.getByRole('table', { name: /files contents/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search any text/i)).toBeVisible()
  })
})
