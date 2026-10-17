import { db } from "../config/db.js";

// GET /api/users
export async function getUsers(req, res) {
  try {
    const result = await db.execute("SELECT id, name, email, role, status FROM `User` ORDER BY id DESC");
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
}

// GET /api/users/:id
export async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const result = await db.execute({
      sql: "SELECT id, name, email, role, status FROM `User` WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `User with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
}

// POST /api/auth/login
export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required.",
    });
  }

  try {
    const result = await db.execute({
      sql: "SELECT id, name, email, password, role, status FROM `User` WHERE email = ?",
      args: [email.trim().toLowerCase()],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Login failed due to server error",
    });
  }
}

// POST /api/users (Register)
export async function createUser(req, res) {
  const { name, email, password, role, status } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Fields 'name', 'email', and 'password' are required.",
    });
  }

  try {
    const result = await db.execute({
      sql: `INSERT INTO \`User\` (name, email, password, role, status)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id, name, email, role, status`,
      args: [
        name.trim(),
        email.trim().toLowerCase(),
        password,
        role ? role.trim() : "customer",
        status ? status.trim() : "active",
      ],
    });

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    if (error.message && error.message.includes("UNIQUE")) {
      return res.status(409).json({
        success: false,
        error: "A user with this email already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, role, status } = req.body;

  try {
    const check = await db.execute({
      sql: "SELECT id, name, email, role, status FROM `User` WHERE id = ?",
      args: [id],
    });

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `User with ID ${id} not found`,
      });
    }

    const current = check.rows[0];
    const newName = name !== undefined ? String(name).trim() : current.name;
    const newRole = role !== undefined ? String(role).trim() : current.role;
    const newStatus = status !== undefined ? String(status).trim() : current.status;

    const result = await db.execute({
      sql: `UPDATE \`User\` SET name = ?, role = ?, status = ? WHERE id = ? RETURNING id, name, email, role, status`,
      args: [newName, newRole, newStatus, id],
    });

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const result = await db.execute({
      sql: "DELETE FROM `User` WHERE id = ?",
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: `User with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${id} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
}
