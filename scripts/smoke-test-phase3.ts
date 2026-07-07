/**
 * Phase 3 verification: boots the prod build and checks
 *  1. JSON-LD is inline in server HTML (no client injection)
 *  2. /curations index renders with curation links
 *  3. The category buying guide is server-rendered (after warming the cache
 *     via one GET to the API route)
 *  4. Footer carries the new /guides and /curations links
 *
 *   npm run build && npx tsx scripts/smoke-test-phase3.ts
 */
import { spawn } from "child_process";

const PORT = 3988;
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

async function main() {
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore" });
  const kill = () => {
    try {
      server.kill("SIGTERM");
    } catch {}
  };
  process.on("exit", kill);

  try {
    await waitForServer();

    let failed = 0;
    const check = (name: string, ok: boolean, detail = "") => {
      console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : ` — ${detail}`}`);
      if (!ok) failed++;
    };

    // 1. Inline JSON-LD on homepage + a product page
    const home = await (await fetch(`${BASE}/`)).text();
    check(
      "homepage JSON-LD inline (Organization + WebSite)",
      home.includes('"@type":"Organization"') && home.includes('"@type":"WebSite"')
    );
    const prodHtml = await (await fetch(`${BASE}/products/swiss-army-classic-sd-pocket-knife-red`)).text();
    check(
      "product page JSON-LD inline (Product + Breadcrumb)",
      prodHtml.includes('"@type":"Product"') && prodHtml.includes('"@type":"BreadcrumbList"')
    );

    // 2. Curations index (renders empty until curations are activated in the
    //    DB — both existing ones are is_active=false, a data decision)
    const cur = await fetch(`${BASE}/curations`);
    const curHtml = await cur.text();
    check(
      "/curations index renders",
      cur.ok && (/href="\/curations\/[a-z0-9-]+"/.test(curHtml) || curHtml.includes("No collections published yet")),
      `status ${cur.status}`
    );

    // 3. Warm the buying-guide cache, then confirm it is server-rendered.
    //    ?sort=rating busts the ISR-prerendered shell so the page re-reads
    //    the category row (including the just-written jsonb cache).
    const warm = await fetch(`${BASE}/api/categories/backpacks/buying-guide`);
    const warmJson: any = warm.ok ? await warm.json() : null;
    const sectionTitle: string | undefined = warmJson?.buyingGuide?.sections?.[0]?.title;
    check("buying-guide API warms cache", !!sectionTitle, `status ${warm.status}`);
    const catHtml = await (await fetch(`${BASE}/categories/backpacks?sort=rating`)).text();
    check(
      "category page server-renders the cached guide",
      !!sectionTitle && catHtml.includes(sectionTitle.slice(0, 30)),
      "guide section title not found in HTML"
    );
    check(
      "category page ItemList JSON-LD inline",
      catHtml.includes('"@type":"ItemList"')
    );

    // 4. Footer links
    check(
      "footer links to /guides and /curations",
      home.includes('href="/guides"') && home.includes('href="/curations"')
    );

    process.exitCode = failed ? 1 : 0;
  } finally {
    kill();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
