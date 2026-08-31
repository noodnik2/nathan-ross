import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vitest/config'

// The carousel page references the existing static/nathan-ross/images/ folder
// via a relative path that reaches outside this package's own root (one
// shared copy, not duplicated - see docs/milestones/milestone8.md, "Images").
// Neither `vite dev` nor `vite preview` serve files outside their project
// root by default, so this plugin exposes that sibling folder at the same
// URL path a deployed build resolves it to, for both dev and preview.
const SHARED_IMAGES_URL_PREFIX = '/nathan-ross/images/'
const SHARED_IMAGES_DIR = path.resolve(__dirname, '../images')

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
}

function serveSharedImages(): Plugin {
  const middleware = (
    req: { url?: string },
    res: {
      statusCode: number
      setHeader: (name: string, value: string) => void
      end: (chunk?: unknown) => void
    },
    next: () => void,
  ) => {
    const url = req.url ?? ''
    if (!url.startsWith(SHARED_IMAGES_URL_PREFIX)) {
      next()
      return
    }
    const relativePath = decodeURIComponent(url.slice(SHARED_IMAGES_URL_PREFIX.length))
    const filePath = path.join(SHARED_IMAGES_DIR, relativePath)
    if (!filePath.startsWith(SHARED_IMAGES_DIR) || !fs.existsSync(filePath)) {
      res.statusCode = 404
      res.end()
      return
    }
    res.setHeader('Content-Type', CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream')
    res.end(fs.readFileSync(filePath))
  }

  return {
    name: 'serve-shared-nathan-ross-images',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  base: '/nathan-ross/carousel/',
  plugins: [serveSharedImages()],
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['src/**/*.test.ts'] },
      },
    ],
  },
})
