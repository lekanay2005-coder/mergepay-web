// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fragment, useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./dialog";

afterEach(() => cleanup());

function TestDialog({ open = true, onClose = vi.fn() }: { open?: boolean; onClose?: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Edit circle" description="Manage members and balances.">
      <button type="button">First action</button>
      <button type="button">Second action</button>
      <button type="button">Third action</button>
    </Dialog>
  );
}

function StatefulDialog() {
  const [open, setOpen] = useState(false);
  const outsideRef = useRef<HTMLButtonElement>(null);

  return (
    <Fragment>
      <button type="button" ref={outsideRef} onClick={() => setOpen(true)}>
        Outside trigger
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit circle"
        description="Manage members and balances."
        triggerRef={outsideRef}
      >
        <button type="button">First action</button>
        <button type="button">Second action</button>
        <button type="button">Third action</button>
      </Dialog>
    </Fragment>
  );
}

describe("Dialog", () => {
  it("uses an accessible dialog title and modal semantics", () => {
    render(<TestDialog />);

    const dialog = screen.getByRole("dialog", { name: "Edit circle" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("traps focus within the dialog and restores it when closed", async () => {
    const user = userEvent.setup();
    render(<StatefulDialog />);

    const outside = screen.getByRole("button", { name: "Outside trigger" });
    await user.click(outside);

    const dialog = screen.getByRole("dialog", { name: "Edit circle" });
    const dialogButtons = within(dialog).getAllByRole("button");

    await user.keyboard("{Tab}");
    expect(dialogButtons.some((button) => document.activeElement === button)).toBe(true);

    await user.keyboard("{Tab}{Tab}");
    expect(dialogButtons.some((button) => document.activeElement === button)).toBe(true);

    await user.keyboard("{Tab}");
    expect(dialogButtons.some((button) => document.activeElement === button)).toBe(true);

    await user.keyboard("{Escape}");
  await waitFor(() => expect(document.activeElement).toBe(outside));
  });

  it("fires the close handler for an Escape key press", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<TestDialog onClose={onClose} />);
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
