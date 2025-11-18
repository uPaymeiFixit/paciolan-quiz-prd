import { Router } from "express";
import { userService } from "../services/userService";
import { z } from "zod";

export const usersRouter = Router();

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
});

// Create a new user
usersRouter.post("/", (req, res) => {
  try {
    const { username } = createUserSchema.parse(req.body);

    // Check if username already exists
    const existingUser = userService.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = userService.createUser(username);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get user by ID
usersRouter.get("/:id", (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Get user by username
usersRouter.get("/username/:username", (req, res) => {
  try {
    const user = userService.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Get all users
usersRouter.get("/", (req, res) => {
  try {
    const users = userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});
