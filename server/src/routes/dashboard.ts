import { Router } from "express";
import { attemptService } from "../services/attemptService";

export const dashboardRouter = Router();

// Get dashboard data for a user
dashboardRouter.get("/:userId", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const stats = attemptService.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    res.status(500).json({ error: "Failed to get dashboard data" });
  }
});
