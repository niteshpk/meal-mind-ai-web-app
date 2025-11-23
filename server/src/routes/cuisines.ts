import { Router, Request, Response } from "express";
import { cuisines } from "../constants/cuisines";

const router: Router = Router();

/**
 * GET /api/cuisines
 * Returns all available cuisines
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, data: cuisines });
});

/**
 * GET /api/cuisines/:id
 * Returns a specific cuisine by ID
 */
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const cuisine = cuisines.find((c) => c.id === id);

  if (!cuisine) {
    return res.status(404).json({
      success: false,
      error: `Cuisine with ID '${id}' not found`,
    });
  }

  res.json({ success: true, data: cuisine });
});

export default router;

