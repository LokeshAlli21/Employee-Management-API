import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  const { first_name, last_name, email, password, phone_number } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const safePhoneNumber = phone_number || null;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO employees 
       (first_name, last_name, email, password, phone_number)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, first_name, last_name, email, phone_number`,
      [first_name, last_name, email, hashedPassword, safePhoneNumber]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM employees WHERE email=$1 AND is_active=true",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const employee = result.rows[0];
  const isMatch = await bcrypt.compare(password, employee.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: generateToken(employee.id),
    employee: {
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      email: employee.email
    }
  });
};

export const getMe = async (req, res) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, phone_number
     FROM employees
     WHERE id = $1 AND is_active = true`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      message: "Employee not found"
    });
  }

  res.json(result.rows[0]);
};

export const updateMe = async (req, res) => {
  const { first_name, last_name, phone_number, password } = req.body;

  // Fetch current employee
  const existing = await pool.query(
    `SELECT * FROM employees WHERE id=$1 AND is_active=true`,
    [req.user.id]
  );

  if (existing.rows.length === 0) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const employee = existing.rows[0];

  // Preserve old values if not provided
  const updatedFirstName = first_name ?? employee.first_name;
  const updatedLastName = last_name ?? employee.last_name;
  const updatedPhone = phone_number ?? employee.phone_number;

  let updatedPassword = employee.password;

  // Update password only if provided
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }
    updatedPassword = await bcrypt.hash(password, 10);
  }

  // Update employee (email intentionally excluded)
  const result = await pool.query(
    `UPDATE employees
     SET first_name=$1,
         last_name=$2,
         phone_number=$3,
         password=$4
     WHERE id=$5
     RETURNING id, first_name, last_name, email, phone_number`,
    [
      updatedFirstName,
      updatedLastName,
      updatedPhone,
      updatedPassword,
      req.user.id
    ]
  );

  res.json(result.rows[0]);
};

export const deleteMe = async (req, res) => {

  const result = await pool.query(
    `UPDATE employees
     SET is_active = false
     WHERE id = $1
     RETURNING id`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      message: "Employee not found"
    });
  }

  res.json({
    message: "Account deleted successfully"
  });
};