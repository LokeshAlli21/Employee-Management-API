import app from "./app.js";
import pool from "./config/db.js";
import env from "./env/env.js";

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection before starting server
    await pool.query("SELECT 1");
    console.log("🗄️ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database", err.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

// Start server
startServer();