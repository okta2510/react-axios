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
    // 1. User table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS \`User\` (
        \`id\` INTEGER PRIMARY KEY AUTOINCREMENT,
        \`name\` TEXT NOT NULL,
        \`email\` TEXT NOT NULL UNIQUE,
        \`password\` TEXT NOT NULL,
        \`role\` TEXT DEFAULT 'customer',
        \`status\` TEXT DEFAULT 'active'
      );
    `);

    // 2. Product table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS \`Product\` (
        \`id\` INTEGER PRIMARY KEY AUTOINCREMENT,
        \`name\` TEXT NOT NULL,
        \`price\` REAL NOT NULL,
        \`category\` TEXT,
        \`stock\` INTEGER DEFAULT 0,
        \`description\` TEXT,
        \`image_url\` TEXT
      );
    `);

    // 3. Order table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS \`Order\` (
        \`id\` INTEGER PRIMARY KEY AUTOINCREMENT,
        \`user_id\` INTEGER NOT NULL,
        \`total_price\` REAL DEFAULT 0,
        \`status\` TEXT DEFAULT 'pending',
        \`created_at\` NUMERIC DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_Order_user_id_User_id_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`User\`(\`id\`)
      );
    `);

    // 4. Order_Product table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS \`Order_Product\` (
        \`order_id\` INTEGER NOT NULL,
        \`product_id\` INTEGER NOT NULL,
        \`quantity\` INTEGER DEFAULT 1,
        CONSTRAINT \`Order_Product_pk\` PRIMARY KEY(\`order_id\`, \`product_id\`),
        CONSTRAINT \`fk_Order_Product_product_id_Product_id_fk\` FOREIGN KEY (\`product_id\`) REFERENCES \`Product\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_Order_Product_order_id_Order_id_fk\` FOREIGN KEY (\`order_id\`) REFERENCES \`Order\`(\`id\`) ON DELETE CASCADE
      );
    `);

    console.log("✅ Database initialized successfully: User, Product, Order, Order_Product tables are ready on Turso.");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error.message);
  }
}
