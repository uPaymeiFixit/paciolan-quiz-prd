import { db } from "../db/database";
import type {
  QuizCategory,
  Quiz,
  QuizWithQuestions,
  Question,
  QuestionWithChoices,
  AnswerChoice,
} from "../../../shared/types";

export const quizService = {
  getAllCategories(): QuizCategory[] {
    const stmt = db.prepare(`
      SELECT id, name, description, slug, created_at
      FROM quiz_categories
      ORDER BY id ASC
    `);

    return stmt.all() as QuizCategory[];
  },

  getCategoryBySlug(slug: string): QuizCategory | null {
    const stmt = db.prepare(`
      SELECT id, name, description, slug, created_at
      FROM quiz_categories
      WHERE slug = ?
    `);

    return stmt.get(slug) as QuizCategory | null;
  },

  getAllQuizzes(): Quiz[] {
    const stmt = db.prepare(`
      SELECT id, category_id, title, description, created_at
      FROM quizzes
      ORDER BY id ASC
    `);

    return stmt.all() as Quiz[];
  },

  getQuizzesByCategory(categoryId: number): Quiz[] {
    const stmt = db.prepare(`
      SELECT id, category_id, title, description, created_at
      FROM quizzes
      WHERE category_id = ?
      ORDER BY id ASC
    `);

    return stmt.all(categoryId) as Quiz[];
  },

  getQuizById(id: number): Quiz | null {
    const stmt = db.prepare(`
      SELECT id, category_id, title, description, created_at
      FROM quizzes
      WHERE id = ?
    `);

    return stmt.get(id) as Quiz | null;
  },

  getQuizWithQuestions(quizId: number): QuizWithQuestions | null {
    const quiz = this.getQuizById(quizId);
    if (!quiz) return null;

    const questionsStmt = db.prepare(`
      SELECT id, quiz_id, question_text, order_index, explanation, created_at
      FROM questions
      WHERE quiz_id = ?
      ORDER BY order_index ASC
    `);

    const questions = questionsStmt.all(quizId) as Question[];

    const questionsWithChoices: QuestionWithChoices[] = questions.map(
      (question) => {
        const choicesStmt = db.prepare(`
        SELECT id, question_id, choice_text, is_correct, order_index
        FROM answer_choices
        WHERE question_id = ?
        ORDER BY order_index ASC
      `);

        const choices = choicesStmt.all(question.id) as AnswerChoice[];

        return {
          ...question,
          choices: choices.map((choice) => ({
            ...choice,
            is_correct: Boolean(choice.is_correct),
          })),
        };
      }
    );

    return {
      ...quiz,
      questions: questionsWithChoices,
    };
  },

  getQuestionById(questionId: number): QuestionWithChoices | null {
    const stmt = db.prepare(`
      SELECT id, quiz_id, question_text, order_index, explanation, created_at
      FROM questions
      WHERE id = ?
    `);

    const question = stmt.get(questionId) as Question | null;
    if (!question) return null;

    const choicesStmt = db.prepare(`
      SELECT id, question_id, choice_text, is_correct, order_index
      FROM answer_choices
      WHERE question_id = ?
      ORDER BY order_index ASC
    `);

    const choices = choicesStmt.all(questionId) as AnswerChoice[];

    return {
      ...question,
      choices: choices.map((choice) => ({
        ...choice,
        is_correct: Boolean(choice.is_correct),
      })),
    };
  },

  getCorrectChoiceForQuestion(questionId: number): AnswerChoice | null {
    const stmt = db.prepare(`
      SELECT id, question_id, choice_text, is_correct, order_index
      FROM answer_choices
      WHERE question_id = ? AND is_correct = 1
      LIMIT 1
    `);

    const choice = stmt.get(questionId) as AnswerChoice | null;
    if (!choice) return null;

    return {
      ...choice,
      is_correct: Boolean(choice.is_correct),
    };
  },
};
