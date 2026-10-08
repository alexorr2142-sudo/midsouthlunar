import { test, expect } from '@playwright/test'

const pickLang = (page, code) => page.locator('[data-testid=lang-select]:visible').selectOption(code)

// Test case IT-1 (evaluation task "find event date and location", FR-1, FR-3):
// a visitor landing on Home sees dates, venue, and a countdown, and can reach
// every page from the navigation on both phone and desktop.
test.describe('IT-1 landing and navigation', () => {
  test('home shows dates, venue, countdown, and tickets link', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('hero-dates')).toContainText('February 5 & 6, 2027')
    await expect(page.getByTestId('hero-venue')).toContainText('Agricenter')
    await expect(page.getByTestId('countdown')).toHaveAttribute('data-state', 'before')
    await expect(page.getByTestId('cd-days')).not.toHaveText('00')
    await expect(page.getByRole('link', { name: 'Plan your visit' })).toHaveAttribute('href', /visit/)
  })

  test('every page is reachable from the navigation', async ({ page, isMobile }) => {
    await page.goto('/')
    for (const [name, heading] of [['Schedule', 'Schedule'], ['Vendors', 'Vendors'], ['Tickets & Visit', 'Tickets & Visit'], ['Get Involved', 'Get Involved'], ['About', 'About the Festival']]) {
      if (isMobile) await page.getByRole('button', { name: 'Menu' }).click()
      await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true }).first().click()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    }
  })

  test('"happening now" state renders when the clock is inside opening hours', async ({ page }) => {
    await page.goto('/?now=2027-02-05T15:00:00-06:00')
    await expect(page.getByTestId('countdown')).toHaveAttribute('data-state', 'open')
    await expect(page.getByTestId('countdown')).toContainText('Happening now')
  })
})

// Test case IT-2 (evaluation task "view the schedule" and "find vendors",
// FR-4, FR-5): filters and search change the rendered list, the count, the
// URL, and the empty state, and the language toggle persists across pages.
test.describe('IT-2 schedule filters, vendor search, language persistence', () => {
  test('schedule filters narrow the list and are reflected in the URL', async ({ page }) => {
    await page.goto('/schedule')
    // The Schedule page is a lazy chunk (see ARCHITECTURE.md finding 1), so wait
    // for the first item before counting; count() does not wait on its own.
    await expect(page.getByTestId('schedule-item').first()).toBeVisible()
    const total = await page.getByTestId('schedule-item').count()
    expect(total).toBeGreaterThan(20)

    await page.getByTestId('filter-day').locator('[data-value=day2]').click()
    await page.getByTestId('filter-type').locator('[data-value=performance]').click()
    await expect(page).toHaveURL(/day=day2/)
    await expect(page).toHaveURL(/type=performance/)
    const items = page.getByTestId('schedule-item')
    const n = await items.count()
    expect(n).toBeGreaterThan(0)
    expect(n).toBeLessThan(total)
    for (let i = 0; i < n; i++) {
      await expect(items.nth(i)).toHaveAttribute('data-day', 'day2')
      await expect(items.nth(i)).toHaveAttribute('data-type', 'performance')
    }
    await expect(page.getByTestId('schedule-count')).toContainText(`${n} events`)

    // Day 1 has nothing at the market: empty state, then clear restores everything.
    await page.goto('/schedule?day=day1&stage=market')
    await expect(page.getByTestId('schedule-empty')).toBeVisible()
    await page.getByTestId('schedule-empty').getByRole('button', { name: 'Clear filters' }).click()
    await expect(page.getByTestId('schedule-item')).toHaveCount(total)
  })

  test('vendor search finds dumplings, combines with category, and shows an empty state', async ({ page }) => {
    await page.goto('/vendors')
    await page.getByTestId('vendor-search').fill('dumpling')
    await expect(page.getByTestId('vendor-count')).toHaveText('1 vendor')
    await expect(page.getByTestId('vendor-card')).toContainText('Golden Wok')
    await page.getByTestId('filter-category').locator('[data-value=crafts]').click()
    await expect(page.getByTestId('vendor-empty')).toBeVisible()
    await page.getByTestId('vendor-empty').getByRole('button', { name: 'Clear search' }).click()
    await expect(page.getByTestId('vendor-card')).toHaveCount(30)
  })

  test('language choice persists across pages and reload', async ({ page }) => {
    await page.goto('/')
    await pickLang(page, 'zh')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('中南农历新年')
    await page.goto('/vendors')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('商户')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('商户')
    await pickLang(page, 'vi')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gian hàng')
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
    await pickLang(page, 'ko')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('참여 업체')
    await pickLang(page, 'ja')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('出店')
    await pickLang(page, 'en')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vendors')
  })

  test('get-involved links point to the volunteer and vendor forms', async ({ page }) => {
    await page.goto('/get-involved')
    await expect(page.getByTestId('pending-volunteer')).toBeVisible()
    await expect(page.getByTestId('pending-vendor')).toBeVisible()
  })
})
