import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("astro site structure", () => {
  it("has an index page", () => {
    const indexPath = path.resolve(__dirname, "pages/index.astro");
    const content = readFileSync(indexPath, "utf8");
    expect(content).toContain("Restrict Tool Access");
  });

  it("has a layout component", () => {
    const layoutPath = path.resolve(__dirname, "layouts/Layout.astro");
    const content = readFileSync(layoutPath, "utf8");
    expect(content).toContain("<slot />");
  });

  it("has required components", () => {
    const components = ["CodeBlock", "InfoBox", "Table"];
    for (const name of components) {
      const filePath = path.resolve(__dirname, `components/${name}.astro`);
      const content = readFileSync(filePath, "utf8");
      expect(content).toContain("<style>");
    }
  });
});
