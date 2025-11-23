/**
 * Validates that at least one cuisine is selected
 * @param cuisines - Array of selected cuisine IDs
 * @returns true if at least one cuisine is selected, false otherwise
 */
export const validateCuisineSelection = (cuisines: string[]): boolean => {
  return cuisines.length > 0;
};

/**
 * Validates that at least one ingredient is selected
 * @param ingredients - Array of selected ingredient IDs
 * @returns true if at least one ingredient is selected, false otherwise
 */
export const validateIngredientSelection = (
  ingredients: string[]
): boolean => {
  return ingredients.length > 0;
};

