// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./dialog";

afterEach(() => cleanup());

function TestDialog({ open = true, onClose = vi.fn() }: { open?: boolean; onClose?: () => void }) {
  return React.createElement(
    Dialog,
    { open, onClose, title: "Edit circle", description: "Manage members and balances." },
    React.createElement("button", { type: "button" }, "First action"),
    React.createElement("button", { type: "button" }, "Second action"),
    React.createElement("button", { type: "button" }, "Third action")
  );
}

function StatefulDialog() {
  const [open, setOpen] = useState(true);
  const outsideRef = React.useRef<HTMLButtonElement>(null);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("button", { type: "button", ref: outsideRef }, "Outside trigger"),
    React.createElement(
      Dialog,
      {
        open,
        onClose: () => setOpen(false),
        title: "Edit circle",
        description: "Manage members and balances.",
        triggerRef: outsideRef,
      },
      React.createElement("button", { type: "button" }, "First action"),
      React.createElement("button", { type: "button" }, "Second action"),
      React.createElement("button", { type: "button" }, "Third action")
    )
  );
}

describe("Dialog", () => {
  it("uses an accessible dialog title and modal semantics", () => {
    render(React.createElement(TestDialog));

    const dialog = screen.getByRole("dialog", { name: "Edit circle" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("traps focus within the dialog and restores it when closed", async () => {
    const user = userEvent.setup();
    render(React.createElement(StatefulDialog));

    const outside = screen.getByRole("button", { name: "Outside trigger" });
    outside.focus();

    const dialog = screen.getByRole("dialog", { name: "Edit circle" });
    const dialogButtons = within(dialog).getAllByRole("button");
    expect(document.activeElement).toBe(outside);

    await user.keyboard("{Tab}");
    expect(dialogButtons.some((button) => document.activeElement === button)).toBe(true);

    await user.keyboard("{Tab}{Tab}");
    expect(dialogButtons.some((button) => document.activeElement === button)).toBe(true);

    await user.keyboard("{Tab}");
    expect(dialogButtons.some((button) => document.activeElement === button)).toBe(true);

    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(outside);
  });

  it("fires the close handler for an Escape key press", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(React.createElement(TestDialog, { onClose }));
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
