import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from server/.env and root .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.warn("⚠️ TURSO_DATABASE_URL is not defined in .env. Falling back to 'file:local.db'.");
}

export const db = createClient({
  url: url || "file:local.db",
  authToken: authToken || undefined,
});

export async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Database initialized successfully. 'items' table is ready on Turso.");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error.message);
  }
}
