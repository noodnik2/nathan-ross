// Build-time gate (wired into `npm run build`): fails the build if
// docs/visual-chronology.md violates the structural invariants the carousel's
// slide model depends on - see docs/milestones/milestone8.md, "Content model".
// Run directly with Node's native TypeScript support (`node scripts/checkSource.ts`).

import { readFileSync } from 'node:fs'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { assertSourceInvariants } from '../src/lib/chronologyModel.ts'

const chronologyPath = path.resolve(
  import.meta.dirname,
  '../../../../docs/visual-chronology.md',
)

const markdown = readFileSync(chronologyPath, 'utf8')
const tokens = new MarkdownIt().parse(markdown, {})

try {
  assertSourceInvariants(tokens)
  console.log(`checkSource: ${path.relative(process.cwd(), chronologyPath)} OK`)
} catch (error) {
  console.error(`checkSource: ${(error as Error).message}`)
  process.exit(1)
}
