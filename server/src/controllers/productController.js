import { db } from "../config/db.js";

// GET /api/products
export async function getProducts(req, res) {
  try {
    const result = await db.execute("SELECT * FROM Product ORDER BY id DESC");
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch products from Turso database",
    });
  }
}

// GET /api/products/:id
export async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const result = await db.execute({
      sql: "SELECT * FROM Product WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
}

// POST /api/products
export async function createProduct(req, res) {
  const { name, price, category, stock, description, image_url } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: "Field 'name' is required.",
    });
  }

  if (price === undefined || isNaN(Number(price))) {
    return res.status(400).json({
      success: false,
      error: "Field 'price' is required and must be a valid number.",
    });
  }

  try {
    const result = await db.execute({
      sql: `INSERT INTO Product (name, price, category, stock, description, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *`,
      args: [
        name.trim(),
        Number(price),
        category ? category.trim() : "General",
        stock !== undefined ? Number(stock) : 0,
        description ? description.trim() : "",
        image_url ? image_url.trim() : "",
      ],
    });

    const newProduct = result.rows[0] || {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      price: Number(price),
      category: category ? category.trim() : "General",
      stock: stock !== undefined ? Number(stock) : 0,
      description: description ? description.trim() : "",
      image_url: image_url ? image_url.trim() : "",
    };

    return res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create product in Turso database",
    });
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, price, category, stock, description, image_url } = req.body;

  try {
    const checkResult = await db.execute({
      sql: "SELECT * FROM Product WHERE id = ?",
      args: [id],
    });

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    const current = checkResult.rows[0];
    const newName = name !== undefined ? String(name).trim() : current.name;
    const newPrice = price !== undefined ? Number(price) : current.price;
    const newCategory = category !== undefined ? String(category).trim() : current.category;
    const newStock = stock !== undefined ? Number(stock) : current.stock;
    const newDesc = description !== undefined ? String(description).trim() : current.description;
    const newImage = image_url !== undefined ? String(image_url).trim() : current.image_url;

    const result = await db.execute({
      sql: `UPDATE Product
            SET name = ?, price = ?, category = ?, stock = ?, description = ?, image_url = ?
            WHERE id = ?
            RETURNING *`,
      args: [newName, newPrice, newCategory, newStock, newDesc, newImage, id],
    });

    return res.status(200).json({
      success: true,
      data: result.rows[0] || {
        ...current,
        name: newName,
        price: newPrice,
        category: newCategory,
        stock: newStock,
        description: newDesc,
        image_url: newImage,
      },
    });
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to update product",
    });
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const result = await db.execute({
      sql: "DELETE FROM Product WHERE id = ?",
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product with ID ${id} was deleted successfully`,
    });
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete product",
    });
  }
}

