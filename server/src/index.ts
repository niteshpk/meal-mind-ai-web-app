import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cuisinesRoutes from "./routes/cuisines";
import ingredientsRoutes from "./routes/ingredients";
import recipeTemplatesRoutes from "./routes/recipe-templates";
import recipesRoutes, { setAIService } from "./routes/recipes";
import authRoutes from "./routes/auth";
import favoritesRoutes from "./routes/favorites";
import historyRoutes from "./routes/history";
import ratingsRoutes from "./routes/ratings";
import recommendationsRoutes from "./routes/recommendations";
import customRecipesRoutes from "./routes/custom-recipes";
import mealPlansRoutes from "./routes/meal-plans";
import substitutionsRoutes from "./routes/substitutions";
import pdfRoutes from "./routes/pdf";
import { AIService } from "./services/ai-service";
import { connectDB } from "./db/connection";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "MealMind AI Server is running" });
});

// API routes - organized by resource
app.use("/api/cuisines", cuisinesRoutes);
app.use("/api/ingredients", ingredientsRoutes);
app.use("/api/recipe-templates", recipeTemplatesRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/custom-recipes", customRecipesRoutes);
app.use("/api/meal-plans", mealPlansRoutes);
app.use("/api/substitutions", substitutionsRoutes);
app.use("/api/pdf", pdfRoutes);

/**
 * Initialize server - connects to database and starts listening
 */
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Initialize AI service if API key is available
    // Check both OPENAI_API_KEY and VITE_OPENAI_API_KEY for compatibility
    const openaiApiKey =
      process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (openaiApiKey) {
      try {
        const aiService = new AIService(openaiApiKey);
        setAIService(aiService);
        console.log("✓ AI service initialized successfully");
      } catch (error) {
        console.error("✗ Failed to initialize AI service:", error);
        console.warn("⚠ Recipe generation will not be available");
      }
    } else {
      console.warn("⚠ OPENAI_API_KEY not found in environment variables");
      console.warn("⚠ Please set OPENAI_API_KEY in your .env file");
      console.warn("⚠ Recipe generation will not be available");
    }

    // Start server only after database connection is established
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Please check your MongoDB connection string in .env file");
    process.exit(1);
  }
}

// Start the server
startServer();
