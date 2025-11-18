# AI Quiz App - Technical Architecture Plan

## Technology Stack

### Frontend

-   **Framework**: React 18+ with TypeScript
-   **Routing**: React Router v6
-   **State Management**: React Context API + hooks (simple, no Redux needed)
-   **Styling**: Tailwind CSS for rapid, consistent UI development
-   **HTTP Client**: Fetch API with custom hooks

### Backend

-   **Runtime**: Node.js with Express.js
-   **Language**: TypeScript
-   **Database**: SQLite (simple, file-based, perfect for this scope)
-   **ORM**: Better-SQLite3 (synchronous, fast, easy to use)
-   **Validation**: Zod for request/response validation
-   **Authentication**: Simple session-based auth (optional username)

### Development Tools

-   **Build Tool**: Vite (fast, modern)
-   **Linting**: ESLint + Prettier
-   **Testing**: Vitest (unit) + Playwright (E2E)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Home Page   │  Quiz Page   │ Results Page │ Dashboard Page │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   API Gateway    │
                    │   (Express.js)   │
                    └──────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  Quiz    │   │   User   │   │  Score   │
        │ Service  │   │ Service  │   │ Service  │
        └──────────┘   └──────────┘   └──────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                    ┌──────────────────┐
                    │  SQLite Database │
                    └──────────────────┘
```

## Database Schema

### Tables

#### users

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### quiz_categories

```sql
CREATE TABLE quiz_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### quizzes

```sql
CREATE TABLE quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES quiz_categories(id)
);
```

#### questions

```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

#### answer_choices

```sql
CREATE TABLE answer_choices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

#### quiz_attempts

```sql
CREATE TABLE quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

#### user_answers

```sql
CREATE TABLE user_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_choice_id INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (selected_choice_id) REFERENCES answer_choices(id)
);
```

## API Endpoints

### User Management

-   `POST /api/users` - Create user profile
-   `GET /api/users/:id` - Get user profile
-   `GET /api/users/:id/stats` - Get user statistics

### Quiz Categories

-   `GET /api/categories` - List all quiz categories

### Quizzes

-   `GET /api/quizzes` - List all quizzes
-   `GET /api/quizzes/:id` - Get quiz details with questions
-   `GET /api/quizzes/category/:categorySlug` - Get quizzes by category

### Quiz Attempts

-   `POST /api/attempts` - Start new quiz attempt
-   `GET /api/attempts/:id` - Get attempt details
-   `POST /api/attempts/:id/answers` - Submit answer
-   `POST /api/attempts/:id/complete` - Complete attempt
-   `GET /api/attempts/user/:userId` - Get user's attempt history

### Dashboard

-   `GET /api/dashboard/:userId` - Get dashboard data (stats, recent attempts)

## Project Structure

```
ai-quiz-app/
├── client/                      # Frontend React app
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ScoreCard.tsx
│   │   │   └── QuizCard.tsx
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── QuizPage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useQuiz.ts
│   │   │   ├── useUser.ts
│   │   │   └── useAttempt.ts
│   │   ├── contexts/            # React contexts
│   │   │   └── UserContext.tsx
│   │   ├── services/            # API service layer
│   │   │   └── api.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                      # Backend Express app
│   ├── src/
│   │   ├── routes/              # API routes
│   │   │   ├── users.ts
│   │   │   ├── quizzes.ts
│   │   │   ├── attempts.ts
│   │   │   └── dashboard.ts
│   │   ├── services/            # Business logic
│   │   │   ├── userService.ts
│   │   │   ├── quizService.ts
│   │   │   └── attemptService.ts
│   │   ├── db/                  # Database layer
│   │   │   ├── database.ts      # DB connection
│   │   │   ├── schema.ts        # Table schemas
│   │   │   └── seed.ts          # Seed data
│   │   ├── middleware/          # Express middleware
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   └── index.ts             # Server entry point
│   └── package.json
├── shared/                      # Shared types between client/server
│   └── types.ts
└── README.md
```

## Key Design Decisions

### 1. SQLite Database

**Rationale**: Lightweight, file-based, zero configuration, perfect for this scope. Easy to backup and migrate. No separate database server needed.

### 2. Monorepo with Separate Client/Server

**Rationale**: Clear separation of concerns, independent scaling, easier to understand and maintain.

### 3. Immediate Feedback Pattern

**Rationale**: After each answer, show correct/incorrect with explanation. This enhances learning and engagement.

### 4. Session-Based Progress

**Rationale**: Optional username allows progress tracking without complex authentication. Simple and user-friendly.

### 5. Quiz Attempt Model

**Rationale**: Each attempt is a separate record, allowing users to retake quizzes and track improvement over time.

## User Flows

### Flow 1: First-Time User

```
Home → Enter Username → Browse Categories → Select Quiz →
Take Quiz → See Results → View Dashboard
```

### Flow 2: Returning User

```
Home → Continue as [Username] → Dashboard →
Select Quiz → Take Quiz → See Results
```

### Flow 3: Quiz Taking

```
Start Quiz → Question 1 → Submit Answer → See Feedback →
Next Question → ... → Complete → View Score & Summary
```

### Flow 4: Review Past Attempt

```
Dashboard → View History → Select Attempt →
Review Questions & Answers
```

## Performance Considerations

1. **Database Indexing**: Add indexes on foreign keys and frequently queried fields
2. **Caching**: Cache quiz data on frontend after first load
3. **Lazy Loading**: Load quiz questions on-demand, not all at once
4. **Optimistic Updates**: Show UI feedback immediately, sync to backend

## Extensibility Points

1. **New Quiz Categories**: Simple INSERT into quiz_categories table
2. **New Questions**: JSON import script for bulk question addition
3. **Question Types**: Schema supports adding new question_type field
4. **Leaderboard**: Already tracking scores, can aggregate easily
5. **Time Limits**: Add time_limit field to quizzes table
6. **Difficulty Levels**: Add difficulty field to quizzes/questions

## Content Seed Data Structure

### Initial Quiz Categories

1. **Agent Fundamentals** - Purpose, structure, and design of AI agents
2. **Prompt Engineering** - How to write effective prompts and control outputs
3. **Model Selection & Context Management** - Choosing the right model and managing context

Each category will have 1-2 quizzes with 5-10 questions each, for a total of ~30-40 initial questions.

## Development Phases

### Phase 1: Foundation (Backend)

-   Set up Express server with TypeScript
-   Create SQLite database with schema
-   Build basic CRUD operations
-   Create seed data for initial quizzes

### Phase 2: Core API

-   Implement all API endpoints
-   Add validation and error handling
-   Test API with Postman/Thunder Client

### Phase 3: Frontend Foundation

-   Set up React + Vite + TypeScript
-   Create basic routing structure
-   Build reusable components
-   Set up API service layer

### Phase 4: Core Features

-   Implement Home page with quiz listing
-   Build Quiz-taking interface
-   Create Results page with scoring
-   Add user dashboard

### Phase 5: Polish & Enhancement

-   Add styling with Tailwind CSS
-   Implement animations and transitions
-   Add loading states and error handling
-   Create responsive design

### Phase 6: Testing & Documentation

-   Write unit tests for services
-   Add E2E tests for critical flows
-   Document API endpoints
-   Create deployment guide

## Success Metrics

1. **User can complete a quiz in under 5 minutes**
2. **Quiz results persist across browser sessions**
3. **Adding new quiz content takes under 5 minutes**
4. **Application loads in under 2 seconds**
5. **Zero data loss during quiz attempts**
6. **Mobile-responsive design works on phones**

## Future Enhancement Ideas

-   Quiz timer and timed challenges
-   Spaced repetition algorithm for weak topics
-   Quiz creation UI for admins
-   Export quiz results as PDF
-   Social sharing of scores
-   Streak tracking and achievements
-   Dark mode support
-   Multi-language support
