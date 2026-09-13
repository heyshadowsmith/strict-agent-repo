// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { focusControl, patchChildren } from "./patch";

function mountList(html: string): HTMLUListElement {
  const parent = document.createElement("ul");
  parent.innerHTML = html;
  document.body.replaceChildren(parent);
  return parent;
}

describe("patchChildren", () => {
  it("keeps unchanged children and replaces changed ones", () => {
    const parent = mountList("<li>A</li><li>B</li>");
    const before = [...parent.children];
    patchChildren(parent, "<li>A</li><li>B!</li>");
    expect(parent.innerHTML).toBe("<li>A</li><li>B!</li>");
    expect(parent.children[0]).toBe(before[0]);
    expect(parent.children[1]).not.toBe(before[1]);
  });

  it("removes, inserts, and appends children in order", () => {
    const parent = mountList("<li>1</li><li>2</li><li>3</li>");
    const before = [...parent.children];
    patchChildren(parent, "<li>0</li><li>2</li><li>3</li><li>4</li>");
    expect(parent.innerHTML).toBe("<li>0</li><li>2</li><li>3</li><li>4</li>");
    expect(parent.children[1]).toBe(before[1]);
    expect(parent.children[2]).toBe(before[2]);
  });

  it("reuses each old child at most once", () => {
    const parent = mountList("<li>x</li>");
    patchChildren(parent, "<li>x</li><li>x</li>");
    expect(parent.innerHTML).toBe("<li>x</li><li>x</li>");
  });

  it("moves focus from a replaced control to its replacement", () => {
    const parent = mountList(
      '<li><button data-action="toggle" data-id="1">off</button></li>',
    );
    parent.querySelector<HTMLElement>("button")?.focus();
    patchChildren(
      parent,
      '<li><button data-action="toggle" data-id="1">on</button></li>',
    );
    expect(document.activeElement?.textContent).toBe("on");
  });
});

describe("focusControl", () => {
  it("focuses the control with the matching action and id", () => {
    const parent = mountList(
      [
        '<button data-action="edit" data-id="1">1</button>',
        '<button data-action="edit" data-id="2">2</button>',
        '<button data-action="remove" data-id="2">x</button>',
      ].join(""),
    );
    focusControl(parent, "edit", "2");
    expect(document.activeElement?.textContent).toBe("2");
  });
});
