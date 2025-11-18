import express from "express";
import cors from "cors";
import { initializeDatabase } from "./db/database";
import { usersRouter } from "./routes/users";
import { quizzesRouter } from "./routes/quizzes";
import { attemptsRouter } from "./routes/attempts";
import { dashboardRouter } from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", usersRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/attempts", attemptsRouter);
app.use("/api/dashboard", dashboardRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
