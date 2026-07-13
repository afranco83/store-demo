import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { VersionBadge } from "./VersionBadge";

const href = "https://github.com/afranco83/store-demo/releases/tag/v1.4.0";

describe("VersionBadge", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<VersionBadge version="1.4.0" href={href} />);

    await expectNoAccessibilityViolations(container);
  });

  it("should render the version prefixed with v and link to the given href", () => {
    renderWithProviders(<VersionBadge version="1.4.0" href={href} />);

    const link = screen.getByRole("link", { name: "v1.4.0" });
    expect(link).toHaveAttribute("href", href);
  });
});
