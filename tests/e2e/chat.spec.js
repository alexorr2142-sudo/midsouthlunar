import { test, expect } from '@playwright/test'

// Test case IT-3 (FR-13): the Yang Yang chat widget opens on any page, answers
// from site data, follows the language of the question, and its links navigate.
test.describe('IT-3 Yang Yang chat widget', () => {
  test('answers a vendor question and links to the Vendors page', async ({ page }) => {
    await page.goto('/visit')
    await page.getByTestId('chat-open').click()
    await expect(page.getByTestId('chat-panel')).toBeVisible()
    await expect(page.getByTestId('chat-bot').first()).toContainText('Yang Yang')
    await page.getByTestId('chat-input').fill('Where can I get dumplings?')
    await page.getByTestId('chat-send').click()
    const reply = page.getByTestId('chat-bot').nth(1)
    await expect(reply).toContainText('Golden Wok')
    await reply.getByRole('link', { name: /See all vendors/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vendors')
    await expect(page.getByTestId('chat-panel')).toBeHidden()
  })

  test('replies in the language of the question regardless of the site language', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('chat-open').click()
    await page.getByTestId('chat-input').fill('세뱃돈은 왜 주나요?')
    await page.getByTestId('chat-send').click()
    await expect(page.getByTestId('chat-bot').nth(1)).toContainText('붉은 봉투')
    await page.getByTestId('chat-input').fill('土曜日は何がありますか？')
    await page.getByTestId('chat-send').click()
    await expect(page.getByTestId('chat-bot').nth(2)).toContainText('2月6日')
  })

  test('starter chips work and the greeting follows the site language', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid=lang-select]:visible').selectOption('vi')
    await page.getByTestId('chat-open').click()
    await expect(page.getByTestId('chat-bot').first()).toContainText('Yang Yang')
    await expect(page.getByTestId('chat-bot').first()).toContainText('lễ hội')
    await page.getByTestId('chat-suggestions').getByRole('button').first().click()
    await expect(page.getByTestId('chat-bot').nth(1)).toContainText('Thứ Bảy')
  })
})
