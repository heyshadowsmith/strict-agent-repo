/// <reference types="vite/client" />
import { assert } from "vitest";
import page from "../../../index.html?raw";
import { mountApp } from "../../app";

interface TodoSeed {
  readonly text: string;
  readonly done: boolean;
}

export function element(selector: string): HTMLElement {
  const found = document.querySelector<HTMLElement>(selector);
  assert.exists(found, `Missing element: ${selector}`);
  return found;
}

export function todoInput(): HTMLInputElement {
  const found = element("#todo-input");
  assert.instanceOf(found, HTMLInputElement);
  return found;
}

function mountFreshPage(): void {
  document.body.innerHTML = new DOMParser().parseFromString(
    page,
    "text/html",
  ).body.innerHTML;
  mountApp(document, localStorage);
}

export function openApp(todos: readonly TodoSeed[]): void {
  const stored = todos.map((todo, index) => ({
    id: String(index + 1),
    ...todo,
  }));
  localStorage.setItem("todos", JSON.stringify(stored));
  mountFreshPage();
}

export function reopenApp(): void {
  mountFreshPage();
}

export function listTexts(): readonly (string | null)[] {
  return [...document.querySelectorAll(".todo span")].map(
    (span) => span.textContent,
  );
}

export function addTodo(text: string): void {
  todoInput().value = text;
  element('#todo-form button[type="submit"]').click();
}

function todoText(text: string): HTMLElement {
  const span = [...document.querySelectorAll<HTMLElement>(".todo span")].find(
    (candidate) => candidate.textContent === text,
  );
  assert.exists(span, `No todo named "${text}"`);
  return span;
}

export function clickTodoText(text: string): void {
  todoText(text).click();
}

export function rowControl(text: string, action: string): HTMLElement {
  const row = todoText(text).closest(".todo");
  assert.exists(row, `No row for "${text}"`);
  const control = row.querySelector<HTMLElement>(`[data-action="${action}"]`);
  assert.exists(control, `No ${action} control for "${text}"`);
  return control;
}

export function clickRowControl(text: string, action: string): void {
  rowControl(text, action).click();
}

export function isDone(text: string): boolean {
  const checkbox = rowControl(text, "toggle");
  assert.instanceOf(checkbox, HTMLInputElement);
  return checkbox.checked;
}
