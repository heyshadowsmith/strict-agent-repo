// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { mountApp } from "./app";

vi.mock("./app", () => ({ mountApp: vi.fn() }));

it("mounts the app on the page document with local storage", async () => {
  await import("./main");

  expect(mountApp).toHaveBeenCalledWith(document, localStorage);
});
