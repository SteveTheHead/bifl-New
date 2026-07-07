/**
 * Crawlability smoke test for the server-rendered /products page (Phase 2).
 * Boots the production build, fetches key URLs like a crawler would (no JS),
 * and asserts product links exist in the raw HTML. Exits non-zero on failure.
 *
 *   npm run build && npx tsx scripts/smoke-test-products.ts
 */
import { spawn } from "child_process";

const PORT = 3987;
const BASE = `http://localhost:${PORT}`;

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start in time");
}

function countMatches(html: string, re: RegExp) {
  return (html.match(re) || []).length;
}

async function main() {
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "ignore",
    detached: false,
  });
  const kill = () => {
    try {
      server.kill("SIGTERM");
    } catch {}
  };
  process.on("exit", kill);

  try {
    await waitForServer();

    const checks: { name: string; url: string; test: (html: string) => string | null }[] = [
      {
        name: "products page 1 has product links",
        url: `${BASE}/products`,
        test: (html) => {
          const n = countMatches(html, /href="\/products\/[a-z0-9-]+"/g);
          return n >= 10 ? null : `only ${n} product links in HTML`;
        },
      },
      {
        name: "products page 2 has product links (crawlable pagination)",
        url: `${BASE}/products?page=2`,
        test: (html) => {
          const n = countMatches(html, /href="\/products\/[a-z0-9-]+"/g);
          return n >= 10 ? null : `only ${n} product links in HTML`;
        },
      },
      {
        name: "page 2 canonical is self-referencing",
        url: `${BASE}/products?page=2`,
        test: (html) =>
          html.includes('rel="canonical"') && html.includes("/products?page=2")
            ? null
            : "canonical missing or not self-referencing",
      },
      {
        name: "badge-filtered view is noindex",
        url: `${BASE}/products?badge=Gold%20Standard`,
        test: (html) => (html.includes("noindex") ? null : "missing noindex"),
      },
      {
        name: "badge filter actually filters",
        url: `${BASE}/products?badge=Gold%20Standard`,
        test: (html) => {
          const m = html.match(/of <!-- -->(\d+)<!-- --> products|of <span[^>]*>(\d+)/);
          const total = m ? parseInt(m[1] || m[2], 10) : NaN;
          return !isNaN(total) && total > 0 && total < 100
            ? null
            : `unexpected filtered total: ${m?.[0] ?? "not found"}`;
        },
      },
    ];

    let failed = 0;
    for (const c of checks) {
      const res = await fetch(c.url);
      const html = await res.text();
      const err = res.ok ? c.test(html) : `HTTP ${res.status}`;
      console.log(`${err ? "FAIL" : "PASS"}  ${c.name}${err ? ` — ${err}` : ""}`);
      if (err) failed++;
    }

    process.exitCode = failed ? 1 : 0;
  } finally {
    kill();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
