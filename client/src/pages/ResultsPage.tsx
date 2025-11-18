import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { api } from "../services/api";
import type { AttemptWithDetails } from "../../../shared/types";

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const [attempt, setAttempt] = useState<AttemptWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Get initial results from navigation state
  const { score, total, percentage, feedback } = location.state || {};

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (id) {
      loadAttemptDetails();
    }
  }, [id, user]);

  async function loadAttemptDetails() {
    if (!id) return;

    try {
      const attemptData = await api.getAttemptWithDetails(parseInt(id));
      setAttempt(attemptData);
    } catch (err) {
      console.error("Failed to load attempt details:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const displayScore = score ?? attempt?.score ?? 0;
  const displayTotal = total ?? attempt?.total_questions ?? 0;
  const displayPercentage =
    percentage ??
    (displayTotal > 0 ? Math.round((displayScore / displayTotal) * 100) : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Quiz Results</h1>
            <Link
              to="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 mb-4">
              <span className="text-4xl font-bold text-primary-600">
                {displayPercentage}%
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {feedback || "Quiz Completed!"}
            </h2>
            <p className="text-xl text-gray-600">
              You scored {displayScore} out of {displayTotal} questions
              correctly
            </p>
          </div>

          {/* Performance Message */}
          <div
            className={`
            p-4 rounded-lg mb-6
            ${displayPercentage >= 90 ? "bg-green-50 text-green-800" : ""}
            ${
              displayPercentage >= 70 && displayPercentage < 90
                ? "bg-blue-50 text-blue-800"
                : ""
            }
            ${
              displayPercentage >= 50 && displayPercentage < 70
                ? "bg-yellow-50 text-yellow-800"
                : ""
            }
            ${displayPercentage < 50 ? "bg-orange-50 text-orange-800" : ""}
          `}
          >
            {displayPercentage >= 90 &&
              "🌟 Outstanding performance! You have excellent knowledge of this topic."}
            {displayPercentage >= 70 &&
              displayPercentage < 90 &&
              "👏 Great job! You have a solid understanding of the material."}
            {displayPercentage >= 50 &&
              displayPercentage < 70 &&
              "💪 Good effort! Review the concepts and try again to improve."}
            {displayPercentage < 50 &&
              "📚 Keep learning! Practice makes perfect. Review the explanations and try again."}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
            >
              Try Another Quiz
            </button>
            {attempt && (
              <button
                onClick={() => navigate(`/quiz/${attempt.quiz_id}`)}
                className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-md hover:bg-primary-50 transition-colors font-medium"
              >
                Retake Quiz
              </button>
            )}
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium inline-block"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Review Answers */}
        {attempt && attempt.answers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Review Your Answers
            </h3>
            <div className="space-y-6">
              {attempt.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={`
                    p-4 rounded-lg border-2
                    ${
                      answer.is_correct
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      Question {index + 1}
                    </h4>
                    {answer.is_correct ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Correct
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm font-medium">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Incorrect
                      </span>
                    )}
                  </div>

                  <p className="text-gray-900 mb-3">{answer.question_text}</p>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Your answer:{" "}
                      </span>
                      <span
                        className={
                          answer.is_correct ? "text-green-700" : "text-red-700"
                        }
                      >
                        {answer.selected_choice_text}
                      </span>
                    </div>

                    {!answer.is_correct && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Correct answer:{" "}
                        </span>
                        <span className="text-green-700">
                          {answer.correct_choice_text}
                        </span>
                      </div>
                    )}

                    {answer.explanation && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-gray-600">{answer.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
