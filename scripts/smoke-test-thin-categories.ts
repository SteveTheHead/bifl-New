/**
 * Verifies thin category pages (< 3 products) are noindex and absent from the
 * sitemap, while a healthy category stays indexable and listed.
 *
 *   npm run build && npx tsx scripts/smoke-test-thin-categories.ts
 */
import { spawn } from 'child_process'

const PORT = 3991
const BASE = `http://localhost:${PORT}`

// From the data pull: cleaning-tools-hardware has 1 product (thin);
// cleaning-tools-home has 24 (healthy).
const THIN = 'cleaning-tools-hardware'
const FAT = 'cleaning-tools-home'

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE, { redirect: 'manual' })
      if (res.status < 500) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('server did not start in time')
}

async function main() {
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore' })
  const kill = () => {
    try {
      server.kill('SIGTERM')
    } catch {}
  }
  process.on('exit', kill)

  try {
    await waitForServer()
    let failed = 0
    const check = (name: string, ok: boolean, detail = '') => {
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : ` — ${detail}`}`)
      if (!ok) failed++
    }

    const thinHtml = await (await fetch(`${BASE}/categories/${THIN}`)).text()
    // robots meta in <head>: noindex present for thin page
    check('thin category page is noindex', /name="robots"[^>]*content="[^"]*noindex/.test(thinHtml))

    const fatHtml = await (await fetch(`${BASE}/categories/${FAT}`)).text()
    check(
      'healthy category page is indexable',
      !/name="robots"[^>]*content="[^"]*noindex/.test(fatHtml)
    )

    const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text()
    check('thin category absent from sitemap', !sitemap.includes(`/categories/${THIN}`))
    check('healthy category present in sitemap', sitemap.includes(`/categories/${FAT}`))

    process.exitCode = failed ? 1 : 0
  } finally {
    kill()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
