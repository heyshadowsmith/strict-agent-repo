import { describe, expect, it } from "vitest";
import {
  renderCount,
  renderEditor,
  renderList,
  renderTodo,
  renderUndoMessage,
} from "./view";

describe("renderTodo", () => {
  it("renders an open todo", () => {
    const html = renderTodo({ id: "1", text: "Buy milk", done: false });
    expect(html).toContain('<li class="todo">');
    expect(html).toContain('data-action="toggle" data-id="1" />');
    expect(html).toContain('data-action="edit" data-id="1"');
    expect(html).toContain('data-action="remove" data-id="1"');
    expect(html).toContain("<span>Buy milk</span>");
  });

  it("renders a completed todo as checked", () => {
    const html = renderTodo({ id: "1", text: "Buy milk", done: true });
    expect(html).toContain('<li class="todo done">');
    expect(html).toContain('data-id="1" checked />');
  });

  it("escapes HTML in the text and id", () => {
    const html = renderTodo({ id: `"'`, text: "<b>&</b>", done: false });
    expect(html).toContain("<span>&lt;b&gt;&amp;&lt;/b&gt;</span>");
    expect(html).toContain('data-id="&quot;&#39;"');
  });
});

describe("renderEditor", () => {
  it("renders an input with the escaped text and id", () => {
    const html = renderEditor({ id: '"', text: '<b>"hi"</b>', done: false });
    expect(html).toContain('data-id="&quot;"');
    expect(html).toContain('value="&lt;b&gt;&quot;hi&quot;&lt;/b&gt;"');
  });
});

describe("renderList", () => {
  it("renders only the todo being edited as an editor", () => {
    const todos = [
      { id: "1", text: "Buy milk", done: false },
      { id: "2", text: "Walk dog", done: true },
    ];
    const html = renderList(todos, "2");
    expect(html).toContain("<span>Buy milk</span>");
    expect(html).toContain('value="Walk dog"');
    expect(html).not.toContain("<span>Walk dog</span>");
  });
});

describe("renderUndoMessage", () => {
  it("names the deleted todo", () => {
    const todo = { id: "1", text: "Buy milk", done: false };
    expect(renderUndoMessage(todo)).toBe("Deleted “Buy milk”");
  });
});

describe("renderCount", () => {
  it("uses the singular for one item", () => {
    expect(renderCount(1)).toBe("1 item left");
  });

  it("uses the plural otherwise", () => {
    expect(renderCount(0)).toBe("0 items left");
  });
});
