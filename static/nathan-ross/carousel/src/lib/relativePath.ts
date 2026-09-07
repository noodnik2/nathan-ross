// Pure string-based POSIX path math, deliberately independent of Node's `path`
// module: this runs both at build time (Node) and, when the carousel derives
// slides directly in the browser, at runtime - Node's `path` isn't available
// there.

function resolve(baseDir: string, relativePath: string): string[] {
  const segments = baseDir.split('/').filter(Boolean)
  for (const segment of relativePath.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') segments.pop()
    else segments.push(segment)
  }
  return segments
}

function relativeTo(fromDir: string, toSegments: string[]): string {
  const fromSegments = fromDir.split('/').filter(Boolean)
  let common = 0
  while (
    common < fromSegments.length &&
    common < toSegments.length &&
    fromSegments[common] === toSegments[common]
  ) {
    common += 1
  }
  const ups = fromSegments.length - common
  const downs = toSegments.slice(common)
  return [...Array(ups).fill('..'), ...downs].join('/')
}

/**
 * Rewrites `rawPath` (relative to `sourceDir`) into an equivalent path
 * relative to `targetDir`, treating both directories as logical paths from a
 * shared root - no real filesystem access involved.
 */
export function rebasePath(rawPath: string, sourceDir: string, targetDir: string): string {
  const resolved = resolve(sourceDir, rawPath)
  return relativeTo(targetDir, resolved)
}

/**
 * True for a path meant to be resolved against the document's own location
 * (rebasePath's domain) - false for a URI with its own scheme (`https:`,
 * `mailto:`, ...) or a same-page `#fragment`, neither of which rebasePath's
 * logical-directory math applies to.
 */
export function isRelativePath(href: string): boolean {
  return !/^([a-z][a-z0-9+.-]*:|#)/i.test(href)
}
