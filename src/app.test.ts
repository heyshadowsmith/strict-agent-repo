// @vitest-environment jsdom
/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import page from "../index.html?raw";
import { mountApp } from "./app";

const stored = [
  { id: "1", text: "Buy milk", done: false },
  { id: "2", text: "Walk dog", done: true },
];

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

function mount(todos: readonly object[] = stored): void {
  localStorage.setItem("todos", JSON.stringify(todos));
  mountApp(document, localStorage);
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = new DOMParser().parseFromString(
    page,
    "text/html",
  ).body.innerHTML;
});

describe("mountApp rendering", () => {
  it("renders stored todos from local storage", () => {
    mount();
    expect(texts()).toEqual(["Buy milk", "Walk dog"]);
    expect(countText()).toBe("1 item left");
    const walk = document.querySelector<HTMLInputElement>('[data-id="2"]');
    expect(required(walk).checked).toBe(true);
  });

  it("starts empty when nothing is stored", () => {
    mountApp(document, localStorage);
    expect(texts()).toEqual([]);
    expect(countText()).toBe("0 items left");
  });

  it("throws when the page is missing an element", () => {
    document.body.innerHTML = "";
    expect(() => {
      mountApp(document, localStorage);
    }).toThrow("Missing element: #todo-form");
  });
});

describe("mountApp actions", () => {
  it("adds a todo when the form is submitted", () => {
    mount([]);
    const input = required(
      document.querySelector<HTMLInputElement>("#todo-input"),
    );
    input.value = "Call mom";
    click('button[type="submit"]');
    expect(texts()).toEqual(["Call mom"]);
    expect(input.value).toBe("");
    expect(localStorage.getItem("todos")).toContain("Call mom");
  });

  it("toggles a todo when its checkbox is clicked", () => {
    mount();
    click('[data-action="toggle"][data-id="1"]');
    expect(countText()).toBe("0 items left");
  });

  it("toggles a todo once when its label text is clicked", () => {
    mount();
    click(".todo span");
    expect(countText()).toBe("0 items left");
  });

  it("removes a todo when its delete button is clicked", () => {
    mount();
    click('[data-action="remove"][data-id="1"]');
    expect(texts()).toEqual(["Walk dog"]);
  });

  it("clears completed todos", () => {
    mount();
    click("#todo-clear");
    expect(texts()).toEqual(["Buy milk"]);
  });

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
});

function undoHidden(): boolean {
  return required(document.querySelector<HTMLElement>("#todo-undo")).hidden;
}

describe("mountApp undo", () => {
  const removeMilk = '[data-action="remove"][data-id="1"]';
  const removeWalk = '[data-action="remove"][data-id="2"]';

  afterEach(() => {
    vi.useRealTimers();
  });

  it("offers to undo a deleted todo", () => {
    mount();
    expect(undoHidden()).toBe(true);
    click(removeMilk);
    expect(undoHidden()).toBe(false);
    const message = required(document.querySelector("#todo-undo-text"));
    expect(message.textContent).toBe("Deleted “Buy milk”");
  });

  it("restores a deleted todo to its original position", () => {
    mount();
    click(removeMilk);
    click("#todo-undo-button");
    expect(texts()).toEqual(["Buy milk", "Walk dog"]);
    expect(localStorage.getItem("todos")).toBe(JSON.stringify(stored));
    expect(undoHidden()).toBe(true);
  });

  it("hides the undo offer after five seconds", () => {
    vi.useFakeTimers();
    mount();
    click(removeMilk);
    vi.advanceTimersByTime(4999);
    expect(undoHidden()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(undoHidden()).toBe(true);
  });

  it("only undoes the most recent delete and restarts the timer", () => {
    vi.useFakeTimers();
    mount();
    click(removeMilk);
    vi.advanceTimersByTime(3000);
    click(removeWalk);
    vi.advanceTimersByTime(3000);
    expect(undoHidden()).toBe(false);
    click("#todo-undo-button");
    expect(texts()).toEqual(["Walk dog"]);
  });

  it("does nothing when there is nothing to undo", () => {
    mount();
    click("#todo-undo-button");
    expect(texts()).toEqual(["Buy milk", "Walk dog"]);
  });
});

function editor(): HTMLInputElement {
  return required(document.querySelector<HTMLInputElement>(".todo-edit"));
}

function press(target: Element, key: string, isComposing = false): void {
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key, isComposing, bubbles: true }),
  );
}

const editMilk = '[data-action="edit"][data-id="1"]';

describe("mountApp editing", () => {
  it("opens an editor with the todo text selected", () => {
    mount();
    click(editMilk);
    const input = editor();
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Buy milk");
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 8]);
    expect(texts()).toEqual(["Walk dog"]);
  });

  it("saves on Enter and returns focus to the edit button", () => {
    mount();
    click(editMilk);
    editor().value = "Buy oat milk";
    press(editor(), "Enter");
    expect(texts()).toEqual(["Buy oat milk", "Walk dog"]);
    expect(localStorage.getItem("todos")).toContain("Buy oat milk");
    expect(document.activeElement).toBe(document.querySelector(editMilk));
  });

  it("saves when the editor loses focus", () => {
    mount();
    click(editMilk);
    editor().value = "Buy oat milk";
    editor().blur();
    expect(texts()).toEqual(["Buy oat milk", "Walk dog"]);
  });

  it("cancels on Escape", () => {
    mount();
    click(editMilk);
    editor().value = "Nope";
    press(editor(), "Escape");
    expect(texts()).toEqual(["Buy milk", "Walk dog"]);
    expect(document.activeElement).toBe(document.querySelector(editMilk));
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
