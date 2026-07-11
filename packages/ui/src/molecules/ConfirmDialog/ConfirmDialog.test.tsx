import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <ConfirmDialog
        isOpen
        title="Delete product?"
        description="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render nothing when closed", () => {
    renderWithProviders(
      <ConfirmDialog
        isOpen={false}
        title="Delete product?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should call onConfirm when the confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    const { user } = renderWithProviders(
      <ConfirmDialog
        isOpen
        title="Delete product?"
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("should call onCancel when the cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const { user } = renderWithProviders(
      <ConfirmDialog isOpen title="Delete product?" onConfirm={vi.fn()} onCancel={onCancel} />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("should call onCancel when Escape is pressed", async () => {
    const onCancel = vi.fn();
    const { user } = renderWithProviders(
      <ConfirmDialog isOpen title="Delete product?" onConfirm={vi.fn()} onCancel={onCancel} />,
    );

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("should disable the cancel button while confirming", () => {
    renderWithProviders(
      <ConfirmDialog
        isOpen
        title="Delete product?"
        isConfirming
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("should move focus into the dialog when it opens", () => {
    renderWithProviders(
      <ConfirmDialog isOpen title="Delete product?" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("should trap Tab focus within the dialog", async () => {
    const { user } = renderWithProviders(
      <ConfirmDialog
        isOpen
        title="Delete product?"
        confirmLabel="Delete"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const confirmButton = screen.getByRole("button", { name: "Delete" });

    confirmButton.focus();
    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();
  });

  it("should restore focus to the previously focused element when it closes", () => {
    function Wrapper({ isOpen }: { isOpen: boolean }) {
      return (
        <>
          <button type="button">Delete product</button>
          <ConfirmDialog
            isOpen={isOpen}
            title="Delete product?"
            onConfirm={vi.fn()}
            onCancel={vi.fn()}
          />
        </>
      );
    }

    const { rerender } = renderWithProviders(<Wrapper isOpen={false} />);
    const triggerButton = screen.getByRole("button", { name: "Delete product" });
    triggerButton.focus();
    expect(triggerButton).toHaveFocus();

    rerender(<Wrapper isOpen />);
    expect(screen.getByRole("dialog")).toHaveFocus();

    rerender(<Wrapper isOpen={false} />);
    expect(triggerButton).toHaveFocus();
  });
});
