import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { createUserFixture, expectNoAccessibilityViolations } from "@store-demo/testing";

import { renderWithProviders } from "@/test/render-with-intl";
import { updateProfileAction } from "../api/update-profile.action";
import { EditProfileForm } from "./EditProfileForm";

vi.mock("../api/update-profile.action", () => ({
  updateProfileAction: vi.fn(),
}));

const mockedUpdateProfileAction = vi.mocked(updateProfileAction);

const profile = createUserFixture({ name: "Cliente Demo", email: "cliente@store-demo.test" });

describe("EditProfileForm", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<EditProfileForm profile={profile} />);

    await expectNoAccessibilityViolations(container);
  });

  it("should prefill the form with the current profile values", () => {
    renderWithProviders(<EditProfileForm profile={profile} />);

    expect(screen.getByLabelText("Nombre")).toHaveValue("Cliente Demo");
    expect(screen.getByLabelText("Email")).toHaveValue("cliente@store-demo.test");
  });

  it("should show validation errors and not call updateProfileAction when fields are empty", async () => {
    const { user } = renderWithProviders(<EditProfileForm profile={profile} />);

    await user.clear(screen.getByLabelText("Nombre"));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(mockedUpdateProfileAction).not.toHaveBeenCalled();
  });

  it("should call updateProfileAction with the form values on submit", async () => {
    mockedUpdateProfileAction.mockResolvedValue({ user: profile });
    const { user } = renderWithProviders(<EditProfileForm profile={profile} />);

    await user.clear(screen.getByLabelText("Nombre"));
    await user.type(screen.getByLabelText("Nombre"), "Nuevo Nombre");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(mockedUpdateProfileAction).toHaveBeenCalledWith({
        name: "Nuevo Nombre",
        email: "cliente@store-demo.test",
      }),
    );
  });

  it("should show a success message after saving", async () => {
    mockedUpdateProfileAction.mockResolvedValue({ user: profile });
    const { user } = renderWithProviders(<EditProfileForm profile={profile} />);

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Cambios guardados.")).toBeInTheDocument();
  });

  it("should show the server error returned by updateProfileAction", async () => {
    mockedUpdateProfileAction.mockResolvedValue({ error: "Ese email ya está en uso." });
    const { user } = renderWithProviders(<EditProfileForm profile={profile} />);

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Ese email ya está en uso.")).toBeInTheDocument();
  });
});
