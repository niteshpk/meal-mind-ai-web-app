/**
 * Formats time in minutes as a display string
 * @param minutes - Time in minutes as a string
 * @returns Formatted time string (e.g., "15 min")
 */
export const formatTime = (minutes: string): string => {
  return `${minutes} min`;
};

/**
 * Formats serving count as a display string
 * @param count - Number of servings
 * @returns Formatted servings string (e.g., "4 servings" or "1 serving")
 */
export const formatServings = (count: number): string => {
  return `${count} serving${count !== 1 ? "s" : ""}`;
};

/**
 * Calculates total time from prep and cook time
 * @param prepTime - Prep time in minutes as a string
 * @param cookTime - Cook time in minutes as a string
 * @returns Total time in minutes as a number
 */
export const calculateTotalTime = (
  prepTime: string,
  cookTime: string
): number => {
  return parseInt(prepTime) + parseInt(cookTime);
};

