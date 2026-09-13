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
    `<button type="button" data-action="edit" data-id="${id}" aria-label="Edit">✎</button>`,
    `<button type="button" data-action="remove" data-id="${id}" aria-label="Delete">×</button>`,
    `</li>`,
  ].join("");
}

export function renderEditor(todo: Todo): string {
  return [
    `<li class="todo">`,
    `<input class="todo-edit" data-id="${escapeHtml(todo.id)}" value="${escapeHtml(todo.text)}" aria-label="Edit to-do" autocomplete="off" />`,
    `</li>`,
  ].join("");
}

export function renderList(
  todos: readonly Todo[],
  editingId: string | null,
): string {
  return todos
    .map((todo) =>
      todo.id === editingId ? renderEditor(todo) : renderTodo(todo),
    )
    .join("");
}

export function renderUndoMessage(todo: Todo): string {
  return `Deleted “${todo.text}”`;
}

export function renderCount(remaining: number): string {
  return `${String(remaining)} ${remaining === 1 ? "item" : "items"} left`;
}
