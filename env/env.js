import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET: process.env.JWT_SECRET,

  NODE_ENV: process.env.NODE_ENV || "development"
};

// Basic validation (optional but professional)
if (!env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in environment variables");
}

if (!env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in environment variables");
}

export default env;
