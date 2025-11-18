import { db } from "../db/database";
import type { User } from "../../../shared/types";

export const userService = {
  createUser(username: string): User {
    const stmt = db.prepare(`
      INSERT INTO users (username) VALUES (?)
    `);

    const result = stmt.run(username);
    const userId = result.lastInsertRowid as number;

    return this.getUserById(userId)!;
  },

  getUserById(id: number): User | null {
    const stmt = db.prepare(`
      SELECT id, username, created_at FROM users WHERE id = ?
    `);

    return stmt.get(id) as User | null;
  },

  getUserByUsername(username: string): User | null {
    const stmt = db.prepare(`
      SELECT id, username, created_at FROM users WHERE username = ?
    `);

    return stmt.get(username) as User | null;
  },

  getAllUsers(): User[] {
    const stmt = db.prepare(`
      SELECT id, username, created_at FROM users ORDER BY created_at DESC
    `);

    return stmt.all() as User[];
  },
};
