import { Router } from "express";
import { attemptService } from "../services/attemptService";
import { z } from "zod";

export const attemptsRouter = Router();

const startAttemptSchema = z.object({
  user_id: z.number(),
  quiz_id: z.number(),
});

const submitAnswerSchema = z.object({
  question_id: z.number(),
  choice_id: z.number(),
});

// Start a new quiz attempt
attemptsRouter.post("/", (req, res) => {
  try {
    const { user_id, quiz_id } = startAttemptSchema.parse(req.body);
    const attempt = attemptService.createAttempt(user_id, quiz_id);
    res.status(201).json(attempt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error starting attempt:", error);
    res.status(500).json({ error: "Failed to start attempt" });
  }
});

// Get attempt by ID
attemptsRouter.get("/:id", (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    if (isNaN(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt ID" });
    }

    const attempt = attemptService.getAttemptById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    res.json(attempt);
  } catch (error) {
    console.error("Error getting attempt:", error);
    res.status(500).json({ error: "Failed to get attempt" });
  }
});

// Get attempt with full details (questions and answers)
attemptsRouter.get("/:id/details", (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    if (isNaN(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt ID" });
    }

    const attempt = attemptService.getAttemptWithDetails(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    res.json(attempt);
  } catch (error) {
    console.error("Error getting attempt details:", error);
    res.status(500).json({ error: "Failed to get attempt details" });
  }
});

// Submit an answer for a question
attemptsRouter.post("/:id/answers", (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    if (isNaN(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt ID" });
    }

    const { question_id, choice_id } = submitAnswerSchema.parse(req.body);

    const result = attemptService.submitAnswer(
      attemptId,
      question_id,
      choice_id
    );
    res.json({
      is_correct: result.isCorrect,
      explanation: result.explanation,
      correct_choice_id: result.correctChoiceId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

// Complete an attempt and calculate final score
attemptsRouter.post("/:id/complete", (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    if (isNaN(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt ID" });
    }

    const result = attemptService.completeAttempt(attemptId);
    const feedback = attemptService.getFeedbackMessage(result.percentage);

    res.json({
      score: result.score,
      total_questions: result.totalQuestions,
      percentage: result.percentage,
      feedback,
    });
  } catch (error) {
    console.error("Error completing attempt:", error);
    res.status(500).json({ error: "Failed to complete attempt" });
  }
});

// Get all attempts for a user
attemptsRouter.get("/user/:userId", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const attempts = attemptService.getUserAttempts(userId);
    res.json(attempts);
  } catch (error) {
    console.error("Error getting user attempts:", error);
    res.status(500).json({ error: "Failed to get user attempts" });
  }
});
