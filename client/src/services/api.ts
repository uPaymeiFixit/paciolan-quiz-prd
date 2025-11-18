import type {
  User,
  QuizCategory,
  Quiz,
  QuizWithQuestions,
  QuizAttempt,
  AttemptWithDetails,
  UserStats,
  CreateUserRequest,
  StartAttemptRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  CompleteAttemptResponse,
} from "../../../shared/types";

const API_BASE = "/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Users
  createUser(username: string): Promise<User> {
    return fetchJSON<User>("/users", {
      method: "POST",
      body: JSON.stringify({ username } as CreateUserRequest),
    });
  },

  getUserById(id: number): Promise<User> {
    return fetchJSON<User>(`/users/${id}`);
  },

  getUserByUsername(username: string): Promise<User> {
    return fetchJSON<User>(`/users/username/${username}`);
  },

  // Quizzes
  getAllCategories(): Promise<QuizCategory[]> {
    return fetchJSON<QuizCategory[]>("/quizzes/categories");
  },

  getCategoryBySlug(slug: string): Promise<QuizCategory> {
    return fetchJSON<QuizCategory>(`/quizzes/categories/${slug}`);
  },

  getAllQuizzes(categoryId?: number): Promise<Quiz[]> {
    const query = categoryId ? `?categoryId=${categoryId}` : "";
    return fetchJSON<Quiz[]>(`/quizzes${query}`);
  },

  getQuizById(id: number): Promise<QuizWithQuestions> {
    return fetchJSON<QuizWithQuestions>(`/quizzes/${id}`);
  },

  // Attempts
  startAttempt(userId: number, quizId: number): Promise<QuizAttempt> {
    return fetchJSON<QuizAttempt>("/attempts", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        quiz_id: quizId,
      } as StartAttemptRequest),
    });
  },

  getAttemptById(id: number): Promise<QuizAttempt> {
    return fetchJSON<QuizAttempt>(`/attempts/${id}`);
  },

  getAttemptWithDetails(id: number): Promise<AttemptWithDetails> {
    return fetchJSON<AttemptWithDetails>(`/attempts/${id}/details`);
  },

  submitAnswer(
    attemptId: number,
    questionId: number,
    choiceId: number
  ): Promise<SubmitAnswerResponse> {
    return fetchJSON<SubmitAnswerResponse>(`/attempts/${attemptId}/answers`, {
      method: "POST",
      body: JSON.stringify({
        question_id: questionId,
        choice_id: choiceId,
      } as SubmitAnswerRequest),
    });
  },

  completeAttempt(attemptId: number): Promise<CompleteAttemptResponse> {
    return fetchJSON<CompleteAttemptResponse>(
      `/attempts/${attemptId}/complete`,
      {
        method: "POST",
      }
    );
  },

  getUserAttempts(userId: number): Promise<AttemptWithDetails[]> {
    return fetchJSON<AttemptWithDetails[]>(`/attempts/user/${userId}`);
  },

  // Dashboard
  getUserStats(userId: number): Promise<UserStats> {
    return fetchJSON<UserStats>(`/dashboard/${userId}`);
  },
};
