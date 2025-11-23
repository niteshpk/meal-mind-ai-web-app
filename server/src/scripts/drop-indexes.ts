import dotenv from "dotenv";
import { connectDB, disconnectDB } from "../db/connection";
import { Recipe } from "../models/Recipe";

dotenv.config();

async function dropIndexes() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();

    console.log("🗑️  Dropping existing indexes on recipes collection...");
    
    try {
      // Drop all indexes except _id
      await Recipe.collection.dropIndexes();
      console.log("✓ All indexes dropped successfully");
    } catch (error: any) {
      if (error.code === 27 || error.codeName === "IndexNotFound") {
        console.log("ℹ️  No indexes to drop (or collection doesn't exist)");
      } else {
        throw error;
      }
    }

    console.log("✅ Index cleanup completed!");
  } catch (error) {
    console.error("❌ Error dropping indexes:", error);
    throw error;
  } finally {
    await disconnectDB();
  }
}

dropIndexes()
  .then(() => {
    console.log("🎉 Process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Process failed:", error);
    process.exit(1);
  });

