import { Link } from "react-router-dom";
import type { Quiz } from "../../../shared/types";

interface QuizCardProps {
  quiz: Quiz;
  categoryName: string;
}

export function QuizCard({ quiz, categoryName }: QuizCardProps) {
  return (
    <Link
      to={`/quiz/${quiz.id}`}
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="mb-2">
        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
          {categoryName}
        </span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
      <p className="text-gray-600">{quiz.description}</p>
      <div className="mt-4 flex items-center text-primary-600 font-medium">
        Start Quiz
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
