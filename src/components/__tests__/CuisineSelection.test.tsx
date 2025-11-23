import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import { CuisineSelection } from "@/components/features/selection/CuisineSelection";

describe("CuisineSelection", () => {
  const mockProps = {
    selectedCuisines: [],
    onToggleCuisine: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
  };

  it("should render the component", () => {
    render(<CuisineSelection {...mockProps} />);

    expect(screen.getByText("Choose Your Cuisine")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("should display selected cuisines count", () => {
    render(
      <CuisineSelection {...mockProps} selectedCuisines={["italian", "mexican"]} />
    );

    expect(screen.getByText(/2 cuisines selected/i)).toBeInTheDocument();
  });

  it("should call onNext when continue button is clicked", async () => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    render(
      <CuisineSelection
        {...mockProps}
        selectedCuisines={["italian"]}
      />
    );

    const continueButton = screen.getByText(/continue to ingredients/i);
    await user.click(continueButton);

    expect(mockProps.onNext).toHaveBeenCalled();
  });

  it("should disable continue button when no cuisines are selected", () => {
    render(<CuisineSelection {...mockProps} selectedCuisines={[]} />);

    const continueButton = screen.getByText(/continue to ingredients/i);
    expect(continueButton).toBeDisabled();
  });
});

