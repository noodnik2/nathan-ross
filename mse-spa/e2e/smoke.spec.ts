import { test, expect } from '@playwright/test'

test('deployed MSE skeleton loads under its GitHub Pages subfolder path', async ({ page }) => {
  // NOTE: '/' would resolve against the origin root, not baseURL's subfolder — see WHATWG URL join
  // semantics. './' correctly stays within baseURL's directory (https://noodnik2.github.io/music-session-explorer/).
  const response = await page.goto('./')
  expect(response?.ok()).toBeTruthy()

  // Confirms the JS bundle actually executed/hydrated, not just that the HTML shell loaded.
  // TODO(Milestone 2): once the recording list ships, assert against it instead.
  await expect(page.locator('#root')).not.toBeEmpty()
})
