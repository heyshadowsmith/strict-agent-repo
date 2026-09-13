export function focusControl(
  parent: Element,
  action: string | undefined,
  id: string | undefined,
): void {
  const controls = parent.querySelectorAll<HTMLElement>("[data-action]");
  for (const control of controls) {
    const { action: controlAction, id: controlId } = control.dataset;
    if (controlAction === action && controlId === id) {
      control.focus();
    }
  }
}

// Reuses children that did not change, so focus and half-finished clicks
// survive a re-render. Focus on a replaced control moves to its replacement.
export function patchChildren(parent: Element, html: string): void {
  const focused = parent.ownerDocument.activeElement;
  const template = parent.ownerDocument.createElement("template");
  template.innerHTML = html;

  const unused = new Set(parent.children);
  const next = [...template.content.children].map((node) => {
    const match = [...unused].find((old) => old.isEqualNode(node));
    if (match === undefined) {
      return node;
    }
    unused.delete(match);
    return match;
  });

  for (const old of unused) {
    old.remove();
  }
  for (const [index, node] of next.entries()) {
    const current = parent.children.item(index);
    if (current === null) {
      parent.append(node);
    } else if (current !== node) {
      current.before(node);
    }
  }

  if (focused instanceof HTMLElement && !focused.isConnected) {
    const { action, id } = focused.dataset;
    focusControl(parent, action, id);
  }
}
