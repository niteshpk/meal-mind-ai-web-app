import mongoose from "mongoose";

/**
 * Connect to MongoDB database
 */
export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MongoDB connection string not found. Please set MONGODB_URI in your .env file"
    );
  }

  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log("✓ Already connected to MongoDB");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("✗ MongoDB disconnection error:", error);
    throw error;
  }
}

