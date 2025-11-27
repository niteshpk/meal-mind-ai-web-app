import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { generateToken, authenticateToken, AuthRequest } from "../middleware/auth";

const router: Router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name: name || undefined,
    });

    await user.save();

    // Generate token
    const token = generateToken({ id: user._id.toString(), email: user.email });

    res.status(201).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user",
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({ id: user._id.toString(), email: user.email });

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to login",
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id)
      .select("-password")
      .populate("favorites", "name cuisine description prepTime cookTime servings difficulty");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        favorites: user.favorites,
        preferences: user.preferences,
        recipeHistoryCount: user.recipeHistory.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
});

/**
 * PUT /api/auth/preferences
 * Update user preferences
 */
router.put("/preferences", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { defaultDietaryRestrictions, favoriteCuisines } = req.body;

    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (defaultDietaryRestrictions !== undefined) {
      user.preferences.defaultDietaryRestrictions = defaultDietaryRestrictions;
    }
    if (favoriteCuisines !== undefined) {
      user.preferences.favoriteCuisines = favoriteCuisines;
    }

    await user.save();

    res.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update preferences",
    });
  }
});

export default router;

