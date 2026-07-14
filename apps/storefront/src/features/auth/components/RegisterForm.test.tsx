import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { expectNoAccessibilityViolations } from "@store-demo/testing";

import { renderWithProviders } from "@/test/render-with-intl";
import { registerAction } from "../api/register.action";
import { RegisterForm } from "./RegisterForm";

vi.mock("../api/register.action", () => ({
  registerAction: vi.fn(),
}));

const mockedRegisterAction = vi.mocked(registerAction);

describe("RegisterForm", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<RegisterForm />);

    await expectNoAccessibilityViolations(container);
  });

  it("should show validation errors and not call registerAction when fields are empty", async () => {
    const { user } = renderWithProviders(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(mockedRegisterAction).not.toHaveBeenCalled();
  });

  it("should call registerAction with the form values on submit", async () => {
    mockedRegisterAction.mockResolvedValue(undefined);
    const { user } = renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText("Nombre"), "Nueva Clienta");
    await user.type(screen.getByLabelText("Email"), "nueva@store-demo.test");
    await user.type(screen.getByLabelText("Contraseña"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() =>
      expect(mockedRegisterAction).toHaveBeenCalledWith({
        name: "Nueva Clienta",
        email: "nueva@store-demo.test",
        password: "Password123!",
      }),
    );
  });

  it("should show the server error returned by registerAction", async () => {
    mockedRegisterAction.mockResolvedValue({ error: "Ya existe una cuenta con ese email." });
    const { user } = renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText("Nombre"), "Nueva Clienta");
    await user.type(screen.getByLabelText("Email"), "existente@store-demo.test");
    await user.type(screen.getByLabelText("Contraseña"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Ya existe una cuenta con ese email.")).toBeInTheDocument();
  });
});
