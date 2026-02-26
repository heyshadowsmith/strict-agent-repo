import type { CreateTodoInput, Todo, UpdateTodoInput } from "./types";

const todos = new Map<string, Todo>();

export function listTodos(): Todo[] {
  return [...todos.values()];
}

export function getTodo(id: string): Todo | undefined {
  return todos.get(id);
}

export function createTodo(input: CreateTodoInput): Todo {
  const id = crypto.randomUUID();
  const todo: Todo = {
    id,
    title: input.title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.set(id, todo);
  return todo;
}

export function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Todo | undefined {
  const existing = todos.get(id);
  if (existing === undefined) return undefined;
  const updated: Todo = {
    id: existing.id,
    title: "title" in input ? input.title : existing.title,
    completed: "completed" in input ? input.completed : existing.completed,
    createdAt: existing.createdAt,
  };
  todos.set(id, updated);
  return updated;
}

export function deleteTodo(id: string): boolean {
  return todos.delete(id);
}

export function clearTodos(): void {
  todos.clear();
}
