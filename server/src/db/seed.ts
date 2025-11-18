import { db, initializeDatabase } from "./database";

// Initialize database tables
initializeDatabase();

// Clear existing data
console.log("Clearing existing data...");
db.exec(`
  DELETE FROM user_answers;
  DELETE FROM quiz_attempts;
  DELETE FROM answer_choices;
  DELETE FROM questions;
  DELETE FROM quizzes;
  DELETE FROM quiz_categories;
  DELETE FROM users;
`);

// Seed quiz categories
console.log("Seeding quiz categories...");
const insertCategory = db.prepare(`
  INSERT INTO quiz_categories (name, description, slug) VALUES (?, ?, ?)
`);

const categories = [
  {
    name: "Agent Fundamentals",
    description: "Learn about AI agent design, purpose, and structure",
    slug: "agent-fundamentals",
  },
  {
    name: "Prompt Engineering",
    description:
      "Master the art of writing effective prompts and controlling AI outputs",
    slug: "prompt-engineering",
  },
  {
    name: "Model Selection & Context",
    description: "Choose the right model and manage context effectively",
    slug: "model-selection-context",
  },
];

categories.forEach((cat) => {
  insertCategory.run(cat.name, cat.description, cat.slug);
});

// Seed quizzes
console.log("Seeding quizzes...");
const insertQuiz = db.prepare(`
  INSERT INTO quizzes (category_id, title, description) VALUES (?, ?, ?)
`);

const quizzes = [
  {
    category_id: 1,
    title: "Introduction to AI Agents",
    description: "Test your understanding of AI agent basics and core concepts",
  },
  {
    category_id: 2,
    title: "Prompt Engineering Essentials",
    description: "Learn how to craft effective prompts for better AI responses",
  },
  {
    category_id: 3,
    title: "Context Management Fundamentals",
    description: "Understand how to work with model context windows and memory",
  },
];

quizzes.forEach((quiz) => {
  insertQuiz.run(quiz.category_id, quiz.title, quiz.description);
});

// Seed questions and answers
console.log("Seeding questions and answers...");
const insertQuestion = db.prepare(`
  INSERT INTO questions (quiz_id, question_text, order_index, explanation)
  VALUES (?, ?, ?, ?)
`);

const insertChoice = db.prepare(`
  INSERT INTO answer_choices (question_id, choice_text, is_correct, order_index)
  VALUES (?, ?, ?, ?)
`);

// Quiz 1: Introduction to AI Agents
const quiz1Questions = [
  {
    text: "What is the primary purpose of an AI agent?",
    explanation:
      "AI agents are designed to autonomously perform tasks and make decisions to achieve specific goals without constant human intervention.",
    choices: [
      { text: "To replace human workers entirely", correct: false },
      {
        text: "To autonomously perform tasks and achieve goals",
        correct: true,
      },
      { text: "To store large amounts of data", correct: false },
      { text: "To generate random responses", correct: false },
    ],
  },
  {
    text: "Which component is essential for an AI agent to interact with its environment?",
    explanation:
      "Sensors allow agents to perceive their environment, while actuators enable them to take actions. Both are essential for interaction.",
    choices: [
      { text: "Database only", correct: false },
      { text: "Sensors and actuators", correct: true },
      { text: "User interface only", correct: false },
      { text: "Static rulebook", correct: false },
    ],
  },
  {
    text: "What distinguishes a reactive agent from a deliberative agent?",
    explanation:
      "Reactive agents respond immediately to stimuli without planning, while deliberative agents consider future consequences and plan actions.",
    choices: [
      {
        text: "Reactive agents plan ahead, deliberative agents do not",
        correct: false,
      },
      {
        text: "Reactive agents respond to stimuli without planning",
        correct: true,
      },
      { text: "Both are identical in behavior", correct: false },
      {
        text: "Deliberative agents cannot sense their environment",
        correct: false,
      },
    ],
  },
  {
    text: 'In agent design, what does "state" refer to?',
    explanation:
      "State represents the agent's internal representation of its current situation, including memory and context about the environment.",
    choices: [
      { text: "The physical location of the server", correct: false },
      {
        text: "The agent's internal representation of its situation",
        correct: true,
      },
      { text: "The programming language used", correct: false },
      { text: "The user interface design", correct: false },
    ],
  },
  {
    text: "What is a key characteristic of a goal-based agent?",
    explanation:
      "Goal-based agents evaluate actions based on whether they help achieve specific goals, rather than just responding to immediate stimuli.",
    choices: [
      { text: "It only responds to immediate inputs", correct: false },
      { text: "It evaluates actions based on goal achievement", correct: true },
      { text: "It has no memory of past actions", correct: false },
      { text: "It cannot adapt to new situations", correct: false },
    ],
  },
];

quiz1Questions.forEach((q, idx) => {
  const result = insertQuestion.run(1, q.text, idx, q.explanation);
  const questionId = result.lastInsertRowid;

  q.choices.forEach((choice, choiceIdx) => {
    insertChoice.run(
      questionId,
      choice.text,
      choice.correct ? 1 : 0,
      choiceIdx
    );
  });
});

// Quiz 2: Prompt Engineering Essentials
const quiz2Questions = [
  {
    text: "What is the most important principle of effective prompt engineering?",
    explanation:
      "Clear, specific instructions help the model understand exactly what is expected, leading to more accurate and relevant responses.",
    choices: [
      { text: "Using the longest possible prompt", correct: false },
      {
        text: "Being clear and specific about the desired output",
        correct: true,
      },
      { text: "Using technical jargon exclusively", correct: false },
      { text: "Avoiding any examples", correct: false },
    ],
  },
  {
    text: "What technique involves providing examples in your prompt?",
    explanation:
      "Few-shot learning provides the model with examples of the desired behavior, helping it understand the pattern and format expected.",
    choices: [
      { text: "Zero-shot prompting", correct: false },
      { text: "Few-shot learning", correct: true },
      { text: "Prompt injection", correct: false },
      { text: "Model fine-tuning", correct: false },
    ],
  },
  {
    text: "Which strategy helps reduce hallucinations in AI responses?",
    explanation:
      "Asking the model to cite sources or explain reasoning helps ground responses in provided information and reduces made-up content.",
    choices: [
      { text: "Using vague, open-ended prompts", correct: false },
      { text: "Requesting longer responses", correct: false },
      { text: "Asking for citations and reasoning", correct: true },
      { text: "Avoiding any constraints", correct: false },
    ],
  },
  {
    text: 'What is "chain-of-thought" prompting?',
    explanation:
      "Chain-of-thought prompting encourages the model to show its reasoning process step-by-step, improving accuracy on complex tasks.",
    choices: [
      { text: "Linking multiple unrelated questions", correct: false },
      {
        text: "Asking the model to explain its reasoning step-by-step",
        correct: true,
      },
      { text: "Using prompts in sequence without context", correct: false },
      { text: "Chaining multiple AI models together", correct: false },
    ],
  },
  {
    text: "How should you handle ambiguous tasks in prompt design?",
    explanation:
      "Breaking down complex or ambiguous tasks into clear, specific sub-tasks helps the model understand exactly what is needed.",
    choices: [
      { text: "Leave them vague for creativity", correct: false },
      { text: "Break them into specific, clear sub-tasks", correct: true },
      { text: "Use technical terminology only", correct: false },
      { text: "Provide no guidance", correct: false },
    ],
  },
  {
    text: "What role does temperature play in model outputs?",
    explanation:
      "Temperature controls randomness: lower values make outputs more focused and deterministic, higher values increase creativity and variation.",
    choices: [
      { text: "It controls the response length", correct: false },
      { text: "It adjusts the randomness of outputs", correct: true },
      { text: "It determines the language used", correct: false },
      { text: "It sets the processing speed", correct: false },
    ],
  },
];

quiz2Questions.forEach((q, idx) => {
  const result = insertQuestion.run(2, q.text, idx, q.explanation);
  const questionId = result.lastInsertRowid;

  q.choices.forEach((choice, choiceIdx) => {
    insertChoice.run(
      questionId,
      choice.text,
      choice.correct ? 1 : 0,
      choiceIdx
    );
  });
});

// Quiz 3: Context Management Fundamentals
const quiz3Questions = [
  {
    text: "What is a context window in language models?",
    explanation:
      "The context window is the maximum amount of text (input + output) that a model can process in a single interaction.",
    choices: [
      { text: "The graphical user interface of the model", correct: false },
      {
        text: "The maximum text length the model can process at once",
        correct: true,
      },
      { text: "The time window for processing requests", correct: false },
      { text: "The model training timeframe", correct: false },
    ],
  },
  {
    text: "Why is context management important in AI applications?",
    explanation:
      "Effective context management ensures relevant information is available to the model while staying within token limits and maintaining performance.",
    choices: [
      { text: "It increases processing speed only", correct: false },
      {
        text: "It ensures relevant information within token limits",
        correct: true,
      },
      { text: "It reduces the need for prompts", correct: false },
      { text: "It eliminates all errors", correct: false },
    ],
  },
  {
    text: "What happens when you exceed a model's context window?",
    explanation:
      "When the context window is exceeded, earlier parts of the conversation are truncated or dropped, potentially losing important information.",
    choices: [
      { text: "The model automatically expands its capacity", correct: false },
      {
        text: "Earlier parts of the conversation are truncated",
        correct: true,
      },
      { text: "The model generates random outputs", correct: false },
      { text: "Processing becomes faster", correct: false },
    ],
  },
  {
    text: "Which technique helps manage long conversations effectively?",
    explanation:
      "Summarizing previous context helps retain important information while reducing token usage in long conversations.",
    choices: [
      { text: "Ignoring previous messages entirely", correct: false },
      { text: "Summarizing previous context periodically", correct: true },
      { text: "Using only the most recent message", correct: false },
      { text: "Increasing the temperature parameter", correct: false },
    ],
  },
  {
    text: "What is the trade-off between context length and model performance?",
    explanation:
      "Larger contexts provide more information but increase processing time, cost, and may reduce response quality in some models.",
    choices: [
      { text: "No trade-off exists", correct: false },
      {
        text: "Longer context increases cost and processing time",
        correct: true,
      },
      { text: "Shorter context always performs better", correct: false },
      { text: "Context length doesn't affect performance", correct: false },
    ],
  },
  {
    text: "When should you consider using RAG (Retrieval-Augmented Generation)?",
    explanation:
      "RAG is ideal when you need to work with large knowledge bases that exceed context windows or require up-to-date external information.",
    choices: [
      { text: "For all simple queries", correct: false },
      {
        text: "When working with large external knowledge bases",
        correct: true,
      },
      { text: "Only for image generation", correct: false },
      { text: "Never, it's always unnecessary", correct: false },
    ],
  },
];

quiz3Questions.forEach((q, idx) => {
  const result = insertQuestion.run(3, q.text, idx, q.explanation);
  const questionId = result.lastInsertRowid;

  q.choices.forEach((choice, choiceIdx) => {
    insertChoice.run(
      questionId,
      choice.text,
      choice.correct ? 1 : 0,
      choiceIdx
    );
  });
});

console.log("Database seeded successfully!");
console.log(`- ${categories.length} categories`);
console.log(`- ${quizzes.length} quizzes`);
console.log(
  `- ${
    quiz1Questions.length + quiz2Questions.length + quiz3Questions.length
  } questions`
);

// Close the database connection
db.close();
