export interface Todo {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
}

export interface Removal {
  readonly todo: Todo;
  readonly index: number;
}

export type Action =
  | { readonly type: "add"; readonly id: string; readonly text: string }
  | { readonly type: "toggle"; readonly id: string }
  | { readonly type: "edit"; readonly id: string; readonly text: string }
  | { readonly type: "remove"; readonly id: string }
  | { readonly type: "restore"; readonly removal: Removal }
  | { readonly type: "clear-completed" };

export function reduce(
  todos: readonly Todo[],
  action: Action,
): readonly Todo[] {
  switch (action.type) {
    case "add": {
      const text = action.text.trim();
      return text === ""
        ? todos
        : [...todos, { id: action.id, text, done: false }];
    }
    case "toggle": {
      return todos.map((todo) =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo,
      );
    }
    case "edit": {
      const text = action.text.trim();
      if (text === "") {
        return todos;
      }
      return todos.map((todo) =>
        todo.id === action.id ? { ...todo, text } : todo,
      );
    }
    case "remove": {
      return todos.filter((todo) => todo.id !== action.id);
    }
    case "restore": {
      const { todo, index } = action.removal;
      return [...todos.slice(0, index), todo, ...todos.slice(index)];
    }
    case "clear-completed": {
      return todos.filter((todo) => !todo.done);
    }
  }
}

export function findRemoval(
  todos: readonly Todo[],
  id: string,
): Removal | null {
  const index = todos.findIndex((todo) => todo.id === id);
  const todo = todos[index];
  return todo === undefined ? null : { todo, index };
}

export function remainingCount(todos: readonly Todo[]): number {
  return todos.filter((todo) => !todo.done).length;
}
