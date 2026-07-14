import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { expectNoAccessibilityViolations } from "@store-demo/testing";

import { renderWithProviders } from "@/test/render-with-intl";
import { loginAction } from "../api/login.action";
import { LoginForm } from "./LoginForm";

// loginAction llama a signIn() de @store-demo/auth, que a su vez carga
// next-auth entero (Credentials provider incluido) — no es lo que este test
// quiere ejercitar (eso es responsabilidad de los specs E2E, que corren
// contra un servidor Next real). Aquí se comprueba el comportamiento del
// formulario: validación de cliente, llamada a la action, error de servidor.
vi.mock("../api/login.action", () => ({
  loginAction: vi.fn(),
}));

const mockedLoginAction = vi.mocked(loginAction);

describe("LoginForm", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<LoginForm />);

    await expectNoAccessibilityViolations(container);
  });

  it("should show validation errors and not call loginAction when fields are empty", async () => {
    const { user } = renderWithProviders(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(mockedLoginAction).not.toHaveBeenCalled();
  });

  it("should call loginAction with the form values on submit", async () => {
    mockedLoginAction.mockResolvedValue(undefined);
    const { user } = renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "customer@store-demo.test");
    await user.type(screen.getByLabelText("Contraseña"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() =>
      expect(mockedLoginAction).toHaveBeenCalledWith({
        email: "customer@store-demo.test",
        password: "Password123!",
      }),
    );
  });

  it("should show the server error returned by loginAction", async () => {
    mockedLoginAction.mockResolvedValue({ error: "Email o contraseña incorrectos." });
    const { user } = renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "customer@store-demo.test");
    await user.type(screen.getByLabelText("Contraseña"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("Email o contraseña incorrectos.")).toBeInTheDocument();
  });
});
