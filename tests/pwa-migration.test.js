import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("旧PWAからの移行", () => {
  it("旧sw.jsがWorkboxキャッシュを削除して登録解除する", () => {
    const worker = fs.readFileSync("sw.js", "utf8");
    expect(worker).toContain('name.startsWith("workbox-")');
    expect(worker).toContain("caches.delete(name)");
    expect(worker).toContain("self.registration.unregister()");
    expect(worker).toContain("client.navigate(client.url)");
  });

  it("現行Service Workerも旧Workboxキャッシュを削除する", () => {
    const worker = fs.readFileSync("service-worker.js", "utf8");
    expect(worker).toContain('name.startsWith("workbox-")');
    expect(worker).toContain("self.registration.scope");
  });
});
