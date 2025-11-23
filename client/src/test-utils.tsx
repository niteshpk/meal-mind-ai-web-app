import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { RecipeProvider } from "@/contexts/RecipeContext";
import { BrowserRouter } from "react-router-dom";

/**
 * Custom render function that includes all providers
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <RecipeProvider>{children}</RecipeProvider>
    </BrowserRouter>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

/**
 * Test data factories for creating mock data
 */
export const createMockRecipe = () => ({
  name: "Test Recipe",
  description: "A test recipe",
  cuisine: "Italian",
  prepTime: "15",
  cookTime: "20",
  servings: 4,
  difficulty: "Medium",
  ingredients: [
    { amount: "2 large", item: "Tomato" },
    { amount: "1 medium", item: "Onion" },
  ],
  instructions: ["Step 1", "Step 2"],
  tips: ["Tip 1", "Tip 2"],
});

