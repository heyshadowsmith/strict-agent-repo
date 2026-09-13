import { loadTodos, saveTodos } from "./storage";
import {
  findRemoval,
  reduce,
  remainingCount,
  type Action,
  type Removal,
} from "./todos";
import { renderCount, renderTodo, renderUndoMessage } from "./view";

const UNDO_TIMEOUT_MS = 5000;

function required<T>(element: T | null, selector: string): T {
  if (element === null) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

function readAction(target: EventTarget | null): Action | null {
  if (!(target instanceof HTMLElement)) {
    return null;
  }
  const { action, id } = target.dataset;
  if (id === undefined) {
    return null;
  }
  if (action === "toggle" || action === "remove") {
    return { type: action, id };
  }
  return null;
}

function mountUndo(
  root: ParentNode,
  restore: (removal: Removal) => void,
): (removal: Removal | null) => void {
  const bar = required(
    root.querySelector<HTMLElement>("#todo-undo"),
    "#todo-undo",
  );
  const text = required(
    root.querySelector("#todo-undo-text"),
    "#todo-undo-text",
  );
  const button = required(
    root.querySelector("#todo-undo-button"),
    "#todo-undo-button",
  );

  let pending: Removal | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const offer = (removal: Removal | null): void => {
    clearTimeout(timer);
    pending = removal;
    bar.hidden = removal === null;
    if (removal !== null) {
      text.textContent = renderUndoMessage(removal.todo);
      timer = setTimeout(() => {
        offer(null);
      }, UNDO_TIMEOUT_MS);
    }
  };

  button.addEventListener("click", () => {
    if (pending !== null) {
      const removal = pending;
      offer(null);
      restore(removal);
    }
  });

  return offer;
}

export function mountApp(
  root: ParentNode,
  storage: Pick<Storage, "getItem" | "setItem">,
): void {
  const form = required(root.querySelector("#todo-form"), "#todo-form");
  const input = required(
    root.querySelector<HTMLInputElement>("#todo-input"),
    "#todo-input",
  );
  const list = required(root.querySelector("#todo-list"), "#todo-list");
  const count = required(root.querySelector("#todo-count"), "#todo-count");
  const clear = required(root.querySelector("#todo-clear"), "#todo-clear");

  let todos = loadTodos(storage);

  const render = (): void => {
    list.innerHTML = todos.map(renderTodo).join("");
    count.textContent = renderCount(remainingCount(todos));
  };

  const dispatch = (action: Action): void => {
    todos = reduce(todos, action);
    saveTodos(storage, todos);
    render();
  };

  const offerUndo = mountUndo(root, (removal) => {
    dispatch({ type: "restore", removal });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    dispatch({ type: "add", id: crypto.randomUUID(), text: input.value });
    input.value = "";
  });

  list.addEventListener("click", (event) => {
    const action = readAction(event.target);
    if (action === null) {
      return;
    }
    if (action.type === "remove") {
      offerUndo(findRemoval(todos, action.id));
    }
    dispatch(action);
  });

  clear.addEventListener("click", () => {
    dispatch({ type: "clear-completed" });
  });

  render();
}
