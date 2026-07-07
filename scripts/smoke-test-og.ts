/**
 * Phase 4 verification: dynamic OG images render as PNGs and the file
 * convention wins the og:image meta tag on detail pages.
 *
 *   npm run build && npx tsx scripts/smoke-test-og.ts
 */
import { spawn } from "child_process";

const PORT = 3989;
const BASE = `http://localhost:${PORT}`;
const SLUG = "swiss-army-classic-sd-pocket-knife-red";

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

    for (const path of [
      `/products/${SLUG}/opengraph-image`,
      `/categories/backpacks/opengraph-image`,
    ]) {
      const res = await fetch(`${BASE}${path}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const isPng = buf.subarray(1, 4).toString() === "PNG";
      check(
        `${path} serves a PNG (${(buf.length / 1024).toFixed(0)}KB)`,
        res.ok && isPng && buf.length > 5000 && buf.length < 400_000,
        `status ${res.status}, ${buf.length} bytes`
      );
    }

    const html = await (await fetch(`${BASE}/products/${SLUG}`)).text();
    const m = html.match(/property="og:image"[^>]*content="([^"]+)"|content="([^"]+)"[^>]*property="og:image"/);
    const ogUrl = m?.[1] || m?.[2] || "";
    check(
      "product og:image points at the dynamic card",
      ogUrl.includes("opengraph-image"),
      `og:image = ${ogUrl || "not found"}`
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
