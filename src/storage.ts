import type { Todo } from "./todos";

const STORAGE_KEY = "todos";

function isTodo(value: unknown): value is Todo {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "text" in value &&
    typeof value.text === "string" &&
    "done" in value &&
    typeof value.done === "boolean"
  );
}

export function loadTodos(storage: Pick<Storage, "getItem">): readonly Todo[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTodo) : [];
  } catch {
    return [];
  }
}

export function saveTodos(
  storage: Pick<Storage, "setItem">,
  todos: readonly Todo[],
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
