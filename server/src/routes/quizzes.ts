import { Router } from "express";
import { quizService } from "../services/quizService";

export const quizzesRouter = Router();

// Get all quiz categories
quizzesRouter.get("/categories", (req, res) => {
  try {
    const categories = quizService.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
});

// Get category by slug
quizzesRouter.get("/categories/:slug", (req, res) => {
  try {
    const category = quizService.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error getting category:", error);
    res.status(500).json({ error: "Failed to get category" });
  }
});

// Get all quizzes
quizzesRouter.get("/", (req, res) => {
  try {
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string)
      : null;

    const quizzes = categoryId
      ? quizService.getQuizzesByCategory(categoryId)
      : quizService.getAllQuizzes();

    res.json(quizzes);
  } catch (error) {
    console.error("Error getting quizzes:", error);
    res.status(500).json({ error: "Failed to get quizzes" });
  }
});

// Get quiz by ID with questions
quizzesRouter.get("/:id", (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const quiz = quizService.getQuizWithQuestions(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error getting quiz:", error);
    res.status(500).json({ error: "Failed to get quiz" });
  }
});
