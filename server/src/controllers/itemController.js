import { db } from "../config/db.js";

// GET /api/items - Retrieve all items
export async function getItems(req, res) {
  try {
    const result = await db.execute("SELECT * FROM items ORDER BY id DESC");
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch items from database",
    });
  }
}

// GET /api/items/:id - Retrieve a single item by ID
export async function getItemById(req, res) {
  const { id } = req.params;
  try {
    const result = await db.execute({
      sql: "SELECT * FROM items WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Item with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch item",
    });
  }
}

// POST /api/items - Create a new item
export async function createItem(req, res) {
  const { title, description } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: "Field 'title' is required and must be a non-empty string.",
    });
  }

  try {
    const result = await db.execute({
      sql: `INSERT INTO items (title, description, completed) 
            VALUES (?, ?, 0) 
            RETURNING *`,
      args: [title.trim(), description ? description.trim() : ""],
    });

    const newItem = result.rows[0] || {
      id: Number(result.lastInsertRowid),
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: 0,
    };

    return res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create item in database",
    });
  }
}

// PUT /api/items/:id - Update an item
export async function updateItem(req, res) {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  try {
    // Check if item exists
    const checkResult = await db.execute({
      sql: "SELECT * FROM items WHERE id = ?",
      args: [id],
    });

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Item with ID ${id} not found`,
      });
    }

    const current = checkResult.rows[0];
    const newTitle = title !== undefined ? String(title).trim() : current.title;
    const newDesc = description !== undefined ? String(description).trim() : current.description;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : current.completed;

    const updateResult = await db.execute({
      sql: `UPDATE items 
            SET title = ?, description = ?, completed = ? 
            WHERE id = ? 
            RETURNING *`,
      args: [newTitle, newDesc, newCompleted, id],
    });

    return res.status(200).json({
      success: true,
      data: updateResult.rows[0] || {
        ...current,
        title: newTitle,
        description: newDesc,
        completed: newCompleted,
      },
    });
  } catch (error) {
    console.error(`Error updating item ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to update item",
    });
  }
}

// DELETE /api/items/:id - Delete an item
export async function deleteItem(req, res) {
  const { id } = req.params;

  try {
    const result = await db.execute({
      sql: "DELETE FROM items WHERE id = ?",
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: `Item with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Item with ID ${id} was deleted successfully`,
    });
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete item",
    });
  }
}

