export interface Todo {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
}

export type Action =
  | { readonly type: "add"; readonly id: string; readonly text: string }
  | { readonly type: "toggle"; readonly id: string }
  | { readonly type: "remove"; readonly id: string }
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
    case "remove": {
      return todos.filter((todo) => todo.id !== action.id);
    }
    case "clear-completed": {
      return todos.filter((todo) => !todo.done);
    }
  }
}

export function remainingCount(todos: readonly Todo[]): number {
  return todos.filter((todo) => !todo.done).length;
}
