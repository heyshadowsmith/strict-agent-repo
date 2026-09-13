import type { Todo } from "./todos";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderTodo(todo: Todo): string {
  const id = escapeHtml(todo.id);
  const checked = todo.done ? " checked" : "";
  return [
    `<li class="${todo.done ? "todo done" : "todo"}">`,
    `<label><input type="checkbox" data-action="toggle" data-id="${id}"${checked} />`,
    `<span>${escapeHtml(todo.text)}</span></label>`,
    `<button type="button" data-action="remove" data-id="${id}" aria-label="Delete">×</button>`,
    `</li>`,
  ].join("");
}

export function renderCount(remaining: number): string {
  return `${String(remaining)} ${remaining === 1 ? "item" : "items"} left`;
}
