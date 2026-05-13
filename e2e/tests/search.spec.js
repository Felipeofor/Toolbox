// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Files tab — client-side search and sort', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: /files/i }).click()
    await expect(page.getByRole('table', { name: /files contents/i })).toBeVisible()
  })

  test('filters rows as you type', async ({ page }) => {
    const initialRows = await page.getByRole('row').count()
    expect(initialRows).toBeGreaterThan(1)

    await page.getByPlaceholder(/search any text/i).fill('zzzzz_no_match_zzzzz')
    await expect(page.getByText(/no rows match/i)).toBeVisible()
  })

  test('toggles sort direction when clicking File Name header', async ({ page }) => {
    const fileHeader = page.getByRole('button', { name: /file name/i })
    await expect(fileHeader).toHaveAttribute('aria-sort', 'ascending')
    await fileHeader.click()
    await expect(fileHeader).toHaveAttribute('aria-sort', 'descending')
  })
})
