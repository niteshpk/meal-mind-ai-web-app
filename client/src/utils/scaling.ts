import { Recipe } from "@/types";

/**
 * Parse ingredient amount string and extract numeric value
 * Handles formats like "2 cups", "1/2 tsp", "3-4", etc.
 */
function parseAmount(amount: string): { value: number; unit: string } {
  const trimmed = amount.trim();
  
  // Handle fractions (1/2, 1/4, etc.)
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)/);
  if (fractionMatch) {
    const numerator = parseFloat(fractionMatch[1]);
    const denominator = parseFloat(fractionMatch[2]);
    const value = numerator / denominator;
    const unit = trimmed.substring(fractionMatch[0].length).trim();
    return { value, unit };
  }
  
  // Handle ranges (3-4)
  const rangeMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const avg = (min + max) / 2;
    const unit = trimmed.substring(rangeMatch[0].length).trim();
    return { value: avg, unit };
  }
  
  // Handle simple numbers
  const numberMatch = trimmed.match(/^(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    const value = parseFloat(numberMatch[1]);
    const unit = trimmed.substring(numberMatch[0].length).trim();
    return { value, unit };
  }
  
  // Fallback for "to taste", "as needed", etc.
  return { value: 0, unit: trimmed };
}

/**
 * Convert decimal to fraction (for common values)
 */
function toFraction(decimal: number): string | null {
  const commonFractions: { [key: number]: string } = {
    0.125: "1/8",
    0.25: "1/4",
    0.33: "1/3",
    0.5: "1/2",
    0.67: "2/3",
    0.75: "3/4",
  };
  
  for (const [dec, frac] of Object.entries(commonFractions)) {
    if (Math.abs(decimal - parseFloat(dec)) < 0.01) {
      return frac;
    }
  }
  
  return null;
}

/**
 * Scale a single ingredient amount
 */
function scaleAmount(amount: string, scaleFactor: number): string {
  const { value, unit } = parseAmount(amount);
  
  if (value === 0 || unit.toLowerCase().includes("taste") || unit.toLowerCase().includes("needed")) {
    return amount; // Don't scale "to taste" amounts
  }
  
  const scaledValue = value * scaleFactor;
  
  // Format nicely
  if (scaledValue < 1 && scaledValue > 0) {
    // Convert to fraction if less than 1
    const fraction = toFraction(scaledValue);
    return fraction ? `${fraction} ${unit}` : `${scaledValue.toFixed(2)} ${unit}`;
  }
  
  // Round to reasonable precision
  const rounded = Math.round(scaledValue * 100) / 100;
  return `${rounded} ${unit}`;
}

/**
 * Scale a time string (e.g., "15", "30")
 * Times are stored as numeric strings representing minutes
 * @param timeString - Time as a string (e.g., "15" for 15 minutes)
 * @param scaleFactor - Factor to scale by
 * @returns Scaled time as a string, rounded to nearest minute
 */
function scaleTime(timeString: string, scaleFactor: number): string {
  if (!timeString || timeString.trim() === "") {
    return timeString;
  }
  
  // Extract numeric value from time string
  // Handles formats like "15", "15 min", "15 minutes", etc.
  const numericMatch = timeString.match(/(\d+(?:\.\d+)?)/);
  if (!numericMatch) {
    return timeString; // Return original if we can't parse
  }
  
  const minutes = parseFloat(numericMatch[1]);
  if (isNaN(minutes) || minutes <= 0) {
    return timeString; // Return original if invalid
  }
  
  // Scale the time proportionally
  const scaledMinutes = minutes * scaleFactor;
  
  // Round to nearest minute (minimum 1 minute)
  const roundedMinutes = Math.max(1, Math.round(scaledMinutes));
  
  // Return as string (without "min" suffix, as that's added by formatTime)
  return roundedMinutes.toString();
}

/**
 * Scale a recipe to a new serving size
 */
export function scaleRecipe(recipe: Recipe, newServings: number): Recipe {
  if (newServings === recipe.servings) {
    return recipe;
  }
  
  const scaleFactor = newServings / recipe.servings;
  
  return {
    ...recipe,
    servings: newServings,
    prepTime: scaleTime(recipe.prepTime, scaleFactor),
    cookTime: scaleTime(recipe.cookTime, scaleFactor),
    ingredients: recipe.ingredients.map((ing) => ({
      ...ing,
      amount: scaleAmount(ing.amount, scaleFactor),
    })),
  };
}

