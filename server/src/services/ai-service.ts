import OpenAI from "openai";
import { Recipe, FlattenedRecipe } from "../types";
import { CuisineNames } from "../models/DefaultData";
import { Ingredient } from "../models/Ingredient";

export class AIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Format ingredient IDs to readable names
   */
  private async formatIngredients(ingredientIds: string[]): Promise<string[]> {
    const ingredients = await Ingredient.find({ id: { $in: ingredientIds } });
    const ingredientMap = new Map(ingredients.map((ing) => [ing.id, ing.name]));
    return ingredientIds.map((id) => ingredientMap.get(id) || id);
  }

  /**
   * Format cuisine IDs to readable names
   */
  private async formatCuisines(cuisineIds: string[]): Promise<string[]> {
    const cuisineNamesDocs = await CuisineNames.find({
      cuisineId: { $in: cuisineIds },
    });
    const cuisineNamesMap = new Map(
      cuisineNamesDocs.map((cn) => [cn.cuisineId, cn.name])
    );
    return cuisineIds.map((id) => cuisineNamesMap.get(id) || id);
  }

  /**
   * Convert flattened structure to nested Recipe
   */
  private unflattenRecipe(flat: FlattenedRecipe): Recipe {
    const ingredients = flat.ingredientAmounts.map((amount, index) => ({
      amount,
      item: flat.ingredientItems[index] || "",
    }));

    return {
      name: flat.name,
      description: flat.description,
      cuisine: flat.cuisine,
      prepTime: flat.prepTime,
      cookTime: flat.cookTime,
      servings: flat.servings,
      difficulty: flat.difficulty,
      ingredients,
      instructions: flat.instructions,
      tips: flat.tips,
    };
  }

  /**
   * Parse TOON format string into FlattenedRecipe
   */
  private parseTOON(toonString: string): FlattenedRecipe {
    const lines = toonString.split("\n");
    const result: Partial<FlattenedRecipe> = {
      ingredientAmounts: [],
      ingredientItems: [],
      instructions: [],
      tips: [],
    };

    let currentSection:
      | "ingredientAmounts"
      | "ingredientItems"
      | "instructions"
      | "tips"
      | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Detect section headers (key followed by colon)
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        // Check if it's a section header
        if (
          key === "ingredientAmounts" ||
          key === "ingredientItems" ||
          key === "instructions" ||
          key === "tips"
        ) {
          currentSection = key as
            | "ingredientAmounts"
            | "ingredientItems"
            | "instructions"
            | "tips";
          continue;
        }

        // Parse simple key-value pairs
        if (key === "name") result.name = value;
        else if (key === "description") result.description = value;
        else if (key === "cuisine") result.cuisine = value;
        else if (key === "prepTime") result.prepTime = value;
        else if (key === "prepTimeMinutes" || key === "prep") result.prepTime = value;
        else if (key === "cookTime") result.cookTime = value;
        else if (key === "cookTimeMinutes" || key === "cook") result.cookTime = value;
        else if (key === "servings") result.servings = parseInt(value, 10) || 4;
        else if (key === "difficulty") result.difficulty = value;
      }

      // Parse array items (lines starting with - or numbered lists)
      if (
        (trimmed.startsWith("-") || trimmed.match(/^\d+[\.\)]/)) &&
        currentSection
      ) {
        const item = trimmed
          .replace(/^[-*]\s*/, "")
          .replace(/^\d+[\.\)]\s*/, "")
          .trim();

        if (currentSection === "ingredientAmounts" && result.ingredientAmounts) {
          result.ingredientAmounts.push(item);
        } else if (
          currentSection === "ingredientItems" &&
          result.ingredientItems
        ) {
          result.ingredientItems.push(item);
        } else if (
          currentSection === "instructions" &&
          result.instructions
        ) {
          result.instructions.push(item);
        } else if (currentSection === "tips" && result.tips) {
          result.tips.push(item);
        }
      }
    }

    // Validate required fields
    if (!result.name || !result.description || !result.cuisine) {
      throw new Error("Missing required fields in TOON response");
    }

    // Ensure arrays exist
    if (!result.ingredientAmounts) result.ingredientAmounts = [];
    if (!result.ingredientItems) result.ingredientItems = [];
    if (!result.instructions) result.instructions = [];
    if (!result.tips) result.tips = [];

    return result as FlattenedRecipe;
  }

  /**
   * Parse AI response into Recipe object
   */
  private async parseAIResponse(
    response: string,
    cuisines: string[]
  ): Promise<Recipe> {
    try {
      // Try to parse as TOON format first (preferred)
      let flatRecipe: FlattenedRecipe | null = null;
      try {
        flatRecipe = this.parseTOON(response);
      } catch {
        // If TOON parsing fails, try JSON as fallback
        try {
          const recipeData = JSON.parse(response);
          // Check if it's already flattened structure
          if (recipeData.ingredientAmounts && recipeData.ingredientItems) {
            flatRecipe = recipeData as FlattenedRecipe;
          } else {
            // Convert nested JSON to flattened
            const formattedCuisines = await this.formatCuisines(cuisines);
            flatRecipe = {
              name: recipeData.name || "AI-Generated Recipe",
              description: recipeData.description || "A delicious recipe created by AI",
              cuisine: recipeData.cuisine || formattedCuisines[0] || "Fusion",
              prepTime: recipeData.prepTime?.toString() || "15",
              cookTime: recipeData.cookTime?.toString() || "20",
              servings: recipeData.servings || 4,
              difficulty: recipeData.difficulty || "Medium",
              ingredientAmounts: Array.isArray(recipeData.ingredients)
                ? recipeData.ingredients.map((ing: any) => ing.amount || ing.quantity || "to taste")
                : [],
              ingredientItems: Array.isArray(recipeData.ingredients)
                ? recipeData.ingredients.map((ing: any) => ing.item || ing.name || ing.ingredient || "")
                : [],
              instructions: Array.isArray(recipeData.instructions)
                ? recipeData.instructions
                : recipeData.instructions
                  ? recipeData.instructions.split("\n").filter((s: string) => s.trim())
                  : [],
              tips: Array.isArray(recipeData.tips)
                ? recipeData.tips
                : recipeData.tips
                  ? recipeData.tips.split("\n").filter((s: string) => s.trim())
                  : [],
            };
          }
        } catch {
          throw new Error("Failed to parse response in any format");
        }
      }

      if (!flatRecipe) {
        throw new Error("Failed to parse response");
      }

      // Validate arrays match
      if (flatRecipe.ingredientAmounts.length !== flatRecipe.ingredientItems.length) {
        // Pad the shorter array if they don't match
        const maxLength = Math.max(
          flatRecipe.ingredientAmounts.length,
          flatRecipe.ingredientItems.length
        );
        while (flatRecipe.ingredientAmounts.length < maxLength) {
          flatRecipe.ingredientAmounts.push("to taste");
        }
        while (flatRecipe.ingredientItems.length < maxLength) {
          flatRecipe.ingredientItems.push("");
        }
      }

      // Convert to nested Recipe structure
      return this.unflattenRecipe(flatRecipe);
    } catch (error) {
      throw new Error(
        `Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Create a detailed prompt for recipe generation
   */
  private createRecipePrompt(
    cuisines: string[],
    ingredients: string[],
    avoidSimilarTo?: string[],
    dietaryRestrictions?: string[]
  ): string {
    const cuisineText =
      cuisines.length === 1
        ? cuisines[0]
        : `a fusion of ${cuisines.join(" and ")}`;
    const ingredientsText = ingredients.join(", ");

    let uniquenessNote = "";
    if (avoidSimilarTo && avoidSimilarTo.length > 0) {
      uniquenessNote = `\n\nCRITICAL: Generate a COMPLETELY DIFFERENT and UNIQUE recipe. Avoid creating recipes similar to these existing ones: ${avoidSimilarTo.join(", ")}. Create a new variation with a different name, different cooking method, and different flavor profile.`;
    }

    let dietaryNote = "";
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      const restrictionsText = dietaryRestrictions
        .map((r) => r.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()))
        .join(", ");
      dietaryNote = `\n\nIMPORTANT: This recipe must be ${restrictionsText}. Ensure all ingredients and cooking methods comply with these dietary restrictions. Do not use any ingredients that violate these restrictions.`;
    }

    return `Create a detailed recipe for a ${cuisineText} dish using the following ingredients: ${ingredientsText}.${uniquenessNote}${dietaryNote}

Please provide a complete recipe in TOON format (Token-Oriented Object Notation) with the following flattened structure:
name: Recipe name
description: Brief description of the dish
cuisine: ${cuisines[0]}
prepTime: preparation time in minutes
cookTime: cooking time in minutes
servings: number of servings
difficulty: Easy, Medium, or Hard
ingredientAmounts:
  - quantity 1
  - quantity 2
  - quantity 3
ingredientItems:
  - ingredient name 1
  - ingredient name 2
  - ingredient name 3
instructions:
  - Step 1 instruction
  - Step 2 instruction
  - Step 3 instruction
tips:
  - Helpful tip 1
  - Helpful tip 2

Important:
- Use TOON format (indentation-based, no braces or brackets)
- Keep structure flat (no nested objects)
- ingredientAmounts and ingredientItems arrays must have matching lengths
- Use all the provided ingredients in the recipe
- Make the recipe authentic to the ${cuisineText} cuisine style
- Provide clear, step-by-step instructions
- Include helpful cooking tips
- Ensure amounts are realistic and practical
- Make the recipe name creative and appealing${avoidSimilarTo && avoidSimilarTo.length > 0 ? "\n- Ensure the recipe name and approach are completely different from the existing recipes mentioned above" : ""}`;
  }

  /**
   * Generate recipe using OpenAI API
   * @param cuisines - Array of cuisine IDs
   * @param ingredients - Array of ingredient IDs
   * @param model - OpenAI model to use
   * @param avoidSimilarTo - Array of recipe names to avoid (for uniqueness)
   * @param dietaryRestrictions - Array of dietary restrictions to apply
   */
  async generateRecipe(
    cuisines: string[],
    ingredients: string[],
    model: string = "gpt-4o-mini",
    avoidSimilarTo?: string[],
    dietaryRestrictions?: string[]
  ): Promise<Recipe> {
    // Validate inputs
    if (cuisines.length === 0) {
      throw new Error("At least one cuisine must be selected");
    }

    if (ingredients.length === 0) {
      throw new Error("At least one ingredient must be selected");
    }

      // Format inputs for AI
      const cuisineNames = await this.formatCuisines(cuisines);
      const ingredientNames = await this.formatIngredients(ingredients);

      // Create prompt
      const prompt = this.createRecipePrompt(
        cuisineNames,
        ingredientNames,
        avoidSimilarTo,
        dietaryRestrictions
      );

    // Call OpenAI API
    const completion = await this.client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are a professional chef and recipe creator. Generate detailed, accurate, and delicious recipes. Always respond in TOON format (Token-Oriented Object Notation) with flattened structure - use indentation-based syntax, no braces or brackets, separate arrays for related data (ingredientAmounts and ingredientItems instead of nested objects).",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

      const responseContent =
        completion.choices[0]?.message?.content || "";

      if (!responseContent) {
        throw new Error("Empty response from OpenAI");
      }

      // Parse response
      return await this.parseAIResponse(responseContent, cuisines);
  }
}

