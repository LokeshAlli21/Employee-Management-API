import jwt from "jsonwebtoken";
import env from "../env/env.js";

export const generateToken = (employeeId) => {
  return jwt.sign(
    { id: employeeId },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
