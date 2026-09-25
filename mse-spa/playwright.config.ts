import { defineConfig } from '@playwright/test'

const baseURL = process.env.MSE_DEPLOY_URL
if (!baseURL) {
  throw new Error(
    'MSE_DEPLOY_URL must be set to the deployed MSE URL (e.g. https://noodnik2.github.io/music-session-explorer/) to run the e2e suite.'
  )
}

export default defineConfig({
  testDir: './e2e',
  use: { baseURL },
})
