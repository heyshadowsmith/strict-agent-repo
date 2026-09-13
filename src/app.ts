import { loadTodos, saveTodos } from "./storage";
import { reduce, remainingCount, type Action } from "./todos";
import { renderCount, renderTodo } from "./view";

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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    dispatch({ type: "add", id: crypto.randomUUID(), text: input.value });
    input.value = "";
  });

  list.addEventListener("click", (event) => {
    const action = readAction(event.target);
    if (action !== null) {
      dispatch(action);
    }
  });

  clear.addEventListener("click", () => {
    dispatch({ type: "clear-completed" });
  });

  render();
}
