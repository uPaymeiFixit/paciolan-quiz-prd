# AI Development Quiz Application

A full-stack quiz application for testing and improving knowledge of AI software development concepts including agent design, prompt engineering, and model selection.

## Features

✅ **User Authentication** - Simple username-based login with persistent sessions
✅ **Multiple Quiz Categories** - Agent Fundamentals, Prompt Engineering, and Context Management
✅ **Interactive Quiz Experience** - Immediate feedback on answers with explanations
✅ **Progress Tracking** - Track scores, attempts, and improvement over time
✅ **User Dashboard** - View statistics, recent attempts, and performance metrics
✅ **Quiz Review** - Review past attempts with correct/incorrect answers
✅ **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## Tech Stack

### Backend

-   **Node.js** with Express.js
-   **TypeScript** for type safety
-   **SQLite** database with better-sqlite3
-   **Zod** for validation

### Frontend

-   **React 18** with TypeScript
-   **React Router** for navigation
-   **Tailwind CSS** for styling
-   **Vite** for fast development

## Project Structure

```
ai-quiz-app/
├── server/              # Backend Express server
│   ├── src/
│   │   ├── db/         # Database setup and seeding
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Business logic
│   │   └── index.ts    # Server entry point
│   └── quiz.db         # SQLite database
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   ├── services/   # API client
│   │   └── main.tsx    # App entry point
│   └── index.html
└── shared/              # Shared TypeScript types
    └── types.ts
```

## Getting Started

### Prerequisites

-   Node.js 18+ installed
-   npm or yarn

### Installation

1. **Clone the repository**

```bash
cd paciolan-quiz-prd
```

2. **Install server dependencies**

```bash
cd server
npm install
```

3. **Seed the database**

```bash
npm run seed
```

4. **Install client dependencies**

```bash
cd ../client
npm install
```

### Running the Application

You need to run both the server and client in separate terminals:

**Terminal 1 - Start the backend server:**

```bash
cd server
npm run dev
```

Server will run on http://localhost:3000

**Terminal 2 - Start the frontend:**

```bash
cd client
npm run dev
```

Client will run on http://localhost:5173

### Usage

1. Open http://localhost:5173 in your browser
2. Enter a username to get started (3+ characters)
3. Browse available quizzes by category
4. Select a quiz and start answering questions
5. Get immediate feedback on each answer
6. View your results and performance statistics
7. Check your dashboard to track progress over time

## Database Schema

The application uses SQLite with the following main tables:

-   **users** - User profiles
-   **quiz_categories** - Quiz category definitions
-   **quizzes** - Quiz metadata
-   **questions** - Quiz questions
-   **answer_choices** - Multiple choice options
-   **quiz_attempts** - User quiz attempts
-   **user_answers** - Individual question answers

## API Endpoints

### Users

-   `POST /api/users` - Create user
-   `GET /api/users/:id` - Get user by ID
-   `GET /api/users/username/:username` - Get user by username

### Quizzes

-   `GET /api/quizzes/categories` - Get all categories
-   `GET /api/quizzes` - Get all quizzes
-   `GET /api/quizzes/:id` - Get quiz with questions

### Attempts

-   `POST /api/attempts` - Start new attempt
-   `POST /api/attempts/:id/answers` - Submit answer
-   `POST /api/attempts/:id/complete` - Complete attempt
-   `GET /api/attempts/user/:userId` - Get user attempts
-   `GET /api/attempts/:id/details` - Get attempt with full details

### Dashboard

-   `GET /api/dashboard/:userId` - Get user statistics

## Initial Quiz Content

The application comes pre-seeded with:

### 1. Agent Fundamentals (5 questions)

-   Purpose and design of AI agents
-   Reactive vs. deliberative agents
-   State management
-   Goal-based agent characteristics

### 2. Prompt Engineering (6 questions)

-   Effective prompt design principles
-   Few-shot learning
-   Chain-of-thought prompting
-   Temperature control
-   Reducing hallucinations

### 3. Context Management (6 questions)

-   Context windows
-   Token management
-   Long conversation handling
-   RAG (Retrieval-Augmented Generation)

## Adding New Quizzes

To add new quizzes or questions, edit `server/src/db/seed.ts` and re-run:

```bash
cd server
npm run seed
```

## Features Implemented

✅ User login/registration
✅ Quiz listing by category
✅ Interactive quiz taking with progress bar
✅ Immediate answer feedback with explanations
✅ Score calculation and performance messages
✅ Quiz results page with detailed review
✅ User dashboard with statistics
✅ Quiz retake functionality
✅ Persistent data storage
✅ Responsive design

## Future Enhancements

Potential features for future development:

-   Quiz timer and timed challenges
-   Leaderboard system
-   Dark mode support
-   Export results as PDF
-   Admin panel for quiz management
-   Spaced repetition algorithm
-   Achievement system
-   Social sharing

## Development

### Build for Production

**Backend:**

```bash
cd server
npm run build
npm start
```

**Frontend:**

```bash
cd client
npm run build
npm run preview
```

### Adding New Question Types

The current implementation supports multiple-choice questions. To add new question types:

1. Update `shared/types.ts` with new question types
2. Modify database schema in `server/src/db/database.ts`
3. Update quiz service to handle new types
4. Create new UI components for the question types

## License

MIT

## Author

Built as a demonstration of full-stack TypeScript development with React and Express.
