import { describe, expect, it } from "vitest";
import { renderCount, renderTodo } from "./view";

describe("renderTodo", () => {
  it("renders an open todo", () => {
    const html = renderTodo({ id: "1", text: "Buy milk", done: false });
    expect(html).toContain('<li class="todo">');
    expect(html).toContain('data-action="toggle" data-id="1" />');
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

describe("renderCount", () => {
  it("uses the singular for one item", () => {
    expect(renderCount(1)).toBe("1 item left");
  });

  it("uses the plural otherwise", () => {
    expect(renderCount(0)).toBe("0 items left");
  });
});
