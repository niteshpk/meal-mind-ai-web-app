/**
 * Custom error types for the application
 */

export class RecipeGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecipeGenerationError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

