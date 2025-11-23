import { Router, Request, Response } from "express";
import { Cuisine } from "../models/Cuisine";

const router: Router = Router();

/**
 * GET /api/cuisines
 * Returns all available cuisines from database
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const cuisines = await Cuisine.find().sort({ name: 1 });
    res.json({ success: true, data: cuisines });
  } catch (error) {
    console.error("Error fetching cuisines:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cuisines",
    });
  }
});

/**
 * GET /api/cuisines/:id
 * Returns a specific cuisine by ID from database
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cuisine = await Cuisine.findOne({ id });

    if (!cuisine) {
      return res.status(404).json({
        success: false,
        error: `Cuisine with ID '${id}' not found`,
      });
    }

    res.json({ success: true, data: cuisine });
  } catch (error) {
    console.error("Error fetching cuisine:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cuisine",
    });
  }
});

export default router;

