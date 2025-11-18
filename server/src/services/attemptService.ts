import { db } from "../db/database";
import { quizService } from "./quizService";
import type {
  QuizAttempt,
  UserAnswer,
  AttemptWithDetails,
  UserAnswerWithDetails,
  UserStats,
} from "../../../shared/types";

export const attemptService = {
  createAttempt(userId: number, quizId: number): QuizAttempt {
    const stmt = db.prepare(`
      INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions)
      VALUES (?, ?, 0, 0)
    `);

    const result = stmt.run(userId, quizId);
    const attemptId = result.lastInsertRowid as number;

    return this.getAttemptById(attemptId)!;
  },

  getAttemptById(id: number): QuizAttempt | null {
    const stmt = db.prepare(`
      SELECT id, user_id, quiz_id, score, total_questions, completed_at
      FROM quiz_attempts
      WHERE id = ?
    `);

    return stmt.get(id) as QuizAttempt | null;
  },

  submitAnswer(
    attemptId: number,
    questionId: number,
    selectedChoiceId: number
  ): { isCorrect: boolean; explanation: string; correctChoiceId: number } {
    const question = quizService.getQuestionById(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const correctChoice = question.choices.find((c) => c.is_correct);
    if (!correctChoice) {
      throw new Error("No correct answer found for question");
    }

    const isCorrect = selectedChoiceId === correctChoice.id;

    const stmt = db.prepare(`
      INSERT INTO user_answers (attempt_id, question_id, selected_choice_id, is_correct)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(attemptId, questionId, selectedChoiceId, isCorrect ? 1 : 0);

    return {
      isCorrect,
      explanation: question.explanation || "",
      correctChoiceId: correctChoice.id,
    };
  },

  completeAttempt(attemptId: number): {
    score: number;
    totalQuestions: number;
    percentage: number;
  } {
    // Count correct answers
    const countStmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM user_answers
      WHERE attempt_id = ?
    `);

    const result = countStmt.get(attemptId) as {
      total: number;
      correct: number;
    };

    // Update attempt with final score
    const updateStmt = db.prepare(`
      UPDATE quiz_attempts
      SET score = ?, total_questions = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(result.correct, result.total, attemptId);

    return {
      score: result.correct,
      totalQuestions: result.total,
      percentage:
        result.total > 0
          ? Math.round((result.correct / result.total) * 100)
          : 0,
    };
  },

  getAttemptWithDetails(attemptId: number): AttemptWithDetails | null {
    const stmt = db.prepare(`
      SELECT
        qa.id, qa.user_id, qa.quiz_id, qa.score, qa.total_questions, qa.completed_at,
        q.title as quiz_title,
        qc.name as category_name
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN quiz_categories qc ON q.category_id = qc.id
      WHERE qa.id = ?
    `);

    const attempt = stmt.get(attemptId) as any;
    if (!attempt) return null;

    const answersStmt = db.prepare(`
      SELECT
        ua.id, ua.attempt_id, ua.question_id, ua.selected_choice_id, ua.is_correct, ua.answered_at,
        q.question_text,
        q.explanation,
        ac1.choice_text as selected_choice_text,
        ac2.choice_text as correct_choice_text
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      JOIN answer_choices ac1 ON ua.selected_choice_id = ac1.id
      JOIN answer_choices ac2 ON ua.question_id = ac2.question_id AND ac2.is_correct = 1
      WHERE ua.attempt_id = ?
      ORDER BY q.order_index ASC
    `);

    const answers = answersStmt.all(attemptId) as any[];

    return {
      id: attempt.id,
      user_id: attempt.user_id,
      quiz_id: attempt.quiz_id,
      score: attempt.score,
      total_questions: attempt.total_questions,
      completed_at: attempt.completed_at,
      quiz_title: attempt.quiz_title,
      category_name: attempt.category_name,
      answers: answers.map((a) => ({
        id: a.id,
        attempt_id: a.attempt_id,
        question_id: a.question_id,
        selected_choice_id: a.selected_choice_id,
        is_correct: Boolean(a.is_correct),
        answered_at: a.answered_at,
        question_text: a.question_text,
        selected_choice_text: a.selected_choice_text,
        correct_choice_text: a.correct_choice_text,
        explanation: a.explanation || "",
      })),
    };
  },

  getUserAttempts(userId: number): AttemptWithDetails[] {
    const stmt = db.prepare(`
      SELECT
        qa.id, qa.user_id, qa.quiz_id, qa.score, qa.total_questions, qa.completed_at,
        q.title as quiz_title,
        qc.name as category_name
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN quiz_categories qc ON q.category_id = qc.id
      WHERE qa.user_id = ? AND qa.total_questions > 0
      ORDER BY qa.completed_at DESC
    `);

    const attempts = stmt.all(userId) as any[];

    return attempts.map((attempt) => ({
      id: attempt.id,
      user_id: attempt.user_id,
      quiz_id: attempt.quiz_id,
      score: attempt.score,
      total_questions: attempt.total_questions,
      completed_at: attempt.completed_at,
      quiz_title: attempt.quiz_title,
      category_name: attempt.category_name,
      answers: [],
    }));
  },

  getUserStats(userId: number): UserStats {
    const statsStmt = db.prepare(`
      SELECT
        COUNT(*) as total_attempts,
        COUNT(DISTINCT quiz_id) as total_quizzes_completed,
        AVG(CAST(score AS FLOAT) / CAST(total_questions AS FLOAT) * 100) as average_score,
        MAX(CAST(score AS FLOAT) / CAST(total_questions AS FLOAT) * 100) as best_score
      FROM quiz_attempts
      WHERE user_id = ? AND total_questions > 0
    `);

    const stats = statsStmt.get(userId) as any;
    const recentAttempts = this.getUserAttempts(userId).slice(0, 5);

    return {
      total_attempts: stats.total_attempts || 0,
      total_quizzes_completed: stats.total_quizzes_completed || 0,
      average_score: Math.round(stats.average_score || 0),
      best_score: Math.round(stats.best_score || 0),
      recent_attempts: recentAttempts,
    };
  },

  getFeedbackMessage(percentage: number): string {
    if (percentage >= 90)
      return "Excellent! You're an AI development expert! 🌟";
    if (percentage >= 70)
      return "Great job! You have a solid understanding! 👏";
    if (percentage >= 50) return "Good effort! Keep practicing to improve! 💪";
    return "Keep learning! Review the concepts and try again! 📚";
  },
};
