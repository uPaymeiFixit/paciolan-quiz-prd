import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { api } from "../services/api";
import type {
  QuizWithQuestions,
  QuestionWithChoices,
} from "../../../shared/types";

export function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [correctChoiceId, setCorrectChoiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadQuizAndStartAttempt();
  }, [id, user]);

  async function loadQuizAndStartAttempt() {
    if (!id || !user) return;

    try {
      const quizData = await api.getQuizById(parseInt(id));
      setQuiz(quizData);

      const attempt = await api.startAttempt(user.id, parseInt(id));
      setAttemptId(attempt.id);
    } catch (err: any) {
      setError(err.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!attemptId || selectedChoice === null || !currentQuestion) return;

    setSubmitting(true);
    try {
      const result = await api.submitAnswer(
        attemptId,
        currentQuestion.id,
        selectedChoice
      );
      setIsCorrect(result.is_correct);
      setExplanation(result.explanation);
      setCorrectChoiceId(result.correct_choice_id);
      setShowFeedback(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setExplanation("");
      setCorrectChoiceId(null);
    } else {
      handleComplete();
    }
  }

  async function handleComplete() {
    if (!attemptId) return;

    try {
      const result = await api.completeAttempt(attemptId);
      navigate(`/results/${attemptId}`, {
        state: {
          score: result.score,
          total: result.total_questions,
          percentage: result.percentage,
          feedback: result.feedback,
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to complete quiz");
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error || "Quiz not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.question_text}
            </h2>

            {/* Choices */}
            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => {
                const isSelected = selectedChoice === choice.id;
                const isCorrectAnswer =
                  showFeedback && choice.id === correctChoiceId;
                const isWrongAnswer = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={choice.id}
                    onClick={() =>
                      !showFeedback && setSelectedChoice(choice.id)
                    }
                    disabled={showFeedback || submitting}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${
                        isSelected && !showFeedback
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200"
                      }
                      ${isCorrectAnswer ? "border-green-600 bg-green-50" : ""}
                      ${isWrongAnswer ? "border-red-600 bg-red-50" : ""}
                      ${
                        !showFeedback && !submitting
                          ? "hover:border-primary-400 cursor-pointer"
                          : "cursor-default"
                      }
                      disabled:opacity-60
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">
                        {choice.choice_text}
                      </span>
                      {showFeedback && (
                        <>
                          {isCorrectAnswer && (
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {isWrongAnswer && (
                            <svg
                              className="w-6 h-6 text-red-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-sm font-medium ${
                      isCorrect ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {isCorrect ? "Correct! 🎉" : "Not quite right"}
                  </h3>
                  <p
                    className={`mt-2 text-sm ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Exit Quiz
            </button>

            {!showFeedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedChoice === null || submitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                {currentQuestionIndex < quiz.questions.length - 1
                  ? "Next Question"
                  : "Complete Quiz"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
