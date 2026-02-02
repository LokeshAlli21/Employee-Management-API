import pkg from "pg";
import env from "../env/env.js";

const { Pool } = pkg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Log successful connection
pool.on("connect", () => {
  console.log("🗄️ PostgreSQL connected");
});

// Handle unexpected errors
pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err.message);
  process.exit(1);
});

export default pool;