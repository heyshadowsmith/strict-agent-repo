// @vitest-environment jsdom
/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import page from "../index.html?raw";
import { mountApp } from "./app";

// User-facing behavior is described in src/features/*.feature. These tests
// cover guards and internals that the scenarios don't reach.

const stored = [
  { id: "1", text: "Buy milk", done: false },
  { id: "2", text: "Walk dog", done: true },
];

const editMilk = '[data-action="edit"][data-id="1"]';

function required<T>(value: T | null): T {
  if (value === null) {
    throw new Error("Element not found");
  }
  return value;
}

function click(selector: string): void {
  required(document.querySelector<HTMLElement>(selector)).click();
}

function texts(): readonly (string | null)[] {
  return [...document.querySelectorAll(".todo span")].map(
    (span) => span.textContent,
  );
}

function countText(): string | null {
  return required(document.querySelector("#todo-count")).textContent;
}

function mount(): void {
  localStorage.setItem("todos", JSON.stringify(stored));
  mountApp(document, localStorage);
}

function undoHidden(): boolean {
  return required(document.querySelector<HTMLElement>("#todo-undo")).hidden;
}

function editor(): HTMLInputElement {
  return required(document.querySelector<HTMLInputElement>(".todo-edit"));
}

function press(target: Element, key: string, isComposing = false): void {
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key, isComposing, bubbles: true }),
  );
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = new DOMParser().parseFromString(
    page,
    "text/html",
  ).body.innerHTML;
});

describe("mountApp setup", () => {
  it("throws when the page is missing an element", () => {
    document.body.innerHTML = "";
    expect(() => {
      mountApp(document, localStorage);
    }).toThrow("Missing element: #todo-form");
  });
});

describe("mountApp ignored input", () => {
  it("ignores clicks that are not todo actions", () => {
    mount();
    const list = required(document.querySelector("#todo-list"));
    list.insertAdjacentHTML(
      "beforeend",
      '<li id="extra"><span data-action="archive" data-id="1">Archive</span> text</li>',
    );
    const extra = required(document.querySelector<HTMLElement>("#extra"));
    click("#extra span");
    extra.click();
    required(extra.lastChild).dispatchEvent(
      new Event("click", { bubbles: true }),
    );
    expect(list.contains(extra)).toBe(true);
    expect(countText()).toBe("1 item left");
  });

  it("does nothing when there is nothing to undo", () => {
    mount();
    click("#todo-undo-button");
    expect(texts()).toEqual(["Buy milk", "Walk dog"]);
  });

  it("ignores deleting a todo that does not exist", () => {
    mount();
    const list = required(document.querySelector("#todo-list"));
    list.insertAdjacentHTML(
      "beforeend",
      '<li><button data-action="remove" data-id="9">×</button></li>',
    );
    click('[data-id="9"]');
    expect(texts()).toEqual(["Buy milk", "Walk dog"]);
    expect(undoHidden()).toBe(true);
  });
});

describe("mountApp editing guards", () => {
  it("ignores other keys, composition, and events outside the editor", () => {
    mount();
    const walk = required(
      document.querySelector<HTMLElement>('[data-action="toggle"]'),
    );
    walk.focus();
    press(walk, "Enter");
    walk.blur();
    click(editMilk);
    press(editor(), "a");
    press(editor(), "Enter", true);
    expect(document.activeElement).toBe(editor());
    expect(texts()).toEqual(["Walk dog"]);
  });

  it("ignores an editor that is not being edited", () => {
    mount();
    const list = required(document.querySelector("#todo-list"));
    list.insertAdjacentHTML(
      "beforeend",
      '<li><input class="todo-edit" data-id="1" /></li>',
    );
    editor().focus();
    editor().blur();
    expect(list.querySelector(".todo-edit")).not.toBeNull();
  });
});

describe("mountApp undo timer", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("only undoes the most recent delete and restarts the timer", () => {
    vi.useFakeTimers();
    mount();
    click('[data-action="remove"][data-id="1"]');
    vi.advanceTimersByTime(3000);
    click('[data-action="remove"][data-id="2"]');
    vi.advanceTimersByTime(3000);
    expect(undoHidden()).toBe(false);
    click("#todo-undo-button");
    expect(texts()).toEqual(["Walk dog"]);
  });
});

describe("mountApp re-rendering", () => {
  it("keeps unchanged rows so clicks on them are not lost", () => {
    mount();
    click(editMilk);
    const walk = required(
      document.querySelector<HTMLElement>(
        '[data-action="toggle"][data-id="2"]',
      ),
    );
    editor().blur();
    walk.click();
    expect(texts()).toEqual(["Buy milk", "Walk dog"]);
    expect(countText()).toBe("2 items left");
  });
});
