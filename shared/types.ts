// Shared types between client and server

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface QuizCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  created_at: string;
}

export interface Quiz {
  id: number;
  category_id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  order_index: number;
  explanation: string;
  created_at: string;
}

export interface AnswerChoice {
  id: number;
  question_id: number;
  choice_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface UserAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_choice_id: number;
  is_correct: boolean;
  answered_at: string;
}

// Extended types for API responses
export interface QuizWithQuestions extends Quiz {
  questions: QuestionWithChoices[];
}

export interface QuestionWithChoices extends Question {
  choices: AnswerChoice[];
}

export interface AttemptWithDetails extends QuizAttempt {
  quiz_title: string;
  category_name: string;
  answers: UserAnswerWithDetails[];
}

export interface UserAnswerWithDetails extends UserAnswer {
  question_text: string;
  selected_choice_text: string;
  correct_choice_text: string;
  explanation: string;
}

export interface UserStats {
  total_attempts: number;
  total_quizzes_completed: number;
  average_score: number;
  best_score: number;
  recent_attempts: AttemptWithDetails[];
}

// API Request/Response types
export interface CreateUserRequest {
  username: string;
}

export interface StartAttemptRequest {
  user_id: number;
  quiz_id: number;
}

export interface SubmitAnswerRequest {
  attempt_id: number;
  question_id: number;
  choice_id: number;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  explanation: string;
  correct_choice_id: number;
}

export interface CompleteAttemptRequest {
  attempt_id: number;
}

export interface CompleteAttemptResponse {
  score: number;
  total_questions: number;
  percentage: number;
  feedback: string;
}
