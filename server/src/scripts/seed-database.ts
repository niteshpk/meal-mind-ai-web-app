import dotenv from "dotenv";
import { connectDB, disconnectDB } from "../db/connection";
import { Cuisine } from "../models/Cuisine";
import { Ingredient } from "../models/Ingredient";
import { CuisineIngredient } from "../models/CuisineIngredient";
import { RecipeTemplate } from "../models/RecipeTemplate";
import { IngredientMap } from "../models/IngredientMap";
import { DefaultInstructions, DefaultTips, CuisineNames } from "../models/DefaultData";
import { cuisines } from "../constants/cuisines";
import { allIngredients, cuisineIngredients } from "../constants/ingredients";
import {
  recipeTemplates,
  ingredientMap,
  defaultInstructions,
  defaultTips,
  cuisineNames,
} from "../constants/recipe-templates";

dotenv.config();

async function seedDatabase() {
  try {
    console.log("🔄 Starting database seeding...");

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing data...");
    await Cuisine.deleteMany({});
    await Ingredient.deleteMany({});
    await CuisineIngredient.deleteMany({});
    await RecipeTemplate.deleteMany({});
    await IngredientMap.deleteMany({});
    await DefaultInstructions.deleteMany({});
    await DefaultTips.deleteMany({});
    await CuisineNames.deleteMany({});

    // Seed Cuisines
    console.log("📝 Seeding cuisines...");
    await Cuisine.insertMany(cuisines);
    console.log(`✓ Inserted ${cuisines.length} cuisines`);

    // Seed Ingredients
    console.log("📝 Seeding ingredients...");
    await Ingredient.insertMany(allIngredients);
    console.log(`✓ Inserted ${allIngredients.length} ingredients`);

    // Seed Cuisine-Ingredient mappings
    console.log("📝 Seeding cuisine-ingredient mappings...");
    const cuisineIngredientDocs = Object.entries(cuisineIngredients).map(
      ([cuisineId, ingredientIds]) => ({
        cuisineId,
        ingredientIds,
      })
    );
    await CuisineIngredient.insertMany(cuisineIngredientDocs);
    console.log(`✓ Inserted ${cuisineIngredientDocs.length} cuisine-ingredient mappings`);

    // Seed Recipe Templates
    console.log("📝 Seeding recipe templates...");
    const templateDocs = Object.entries(recipeTemplates).map(
      ([cuisineId, template]) => ({
        cuisineId,
        ...template,
      })
    );
    await RecipeTemplate.insertMany(templateDocs);
    console.log(`✓ Inserted ${templateDocs.length} recipe templates`);

    // Seed Ingredient Map
    console.log("📝 Seeding ingredient map...");
    const ingredientMapDocs = Object.entries(ingredientMap).map(
      ([ingredientId, defaultAmount]) => ({
        ingredientId,
        defaultAmount,
      })
    );
    await IngredientMap.insertMany(ingredientMapDocs);
    console.log(`✓ Inserted ${ingredientMapDocs.length} ingredient mappings`);

    // Seed Default Instructions
    console.log("📝 Seeding default instructions...");
    await DefaultInstructions.create({ instructions: defaultInstructions });
    console.log("✓ Inserted default instructions");

    // Seed Default Tips
    console.log("📝 Seeding default tips...");
    await DefaultTips.create({ tips: defaultTips });
    console.log("✓ Inserted default tips");

    // Seed Cuisine Names
    console.log("📝 Seeding cuisine names...");
    const cuisineNameDocs = Object.entries(cuisineNames).map(
      ([cuisineId, name]) => ({
        cuisineId,
        name,
      })
    );
    await CuisineNames.insertMany(cuisineNameDocs);
    console.log(`✓ Inserted ${cuisineNameDocs.length} cuisine names`);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await disconnectDB();
  }
}

// Run the seed script
seedDatabase()
  .then(() => {
    console.log("🎉 Seeding process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding process failed:", error);
    process.exit(1);
  });

