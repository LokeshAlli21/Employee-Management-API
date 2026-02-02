import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { logger } from "./middleware/logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors()); // for now Allows requests from ANY origin

app.use(logger);
app.use(express.json());

app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Employee Management API is running 🚀" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
