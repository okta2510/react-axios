import { db } from "../config/db.js";

// GET /api/orders (Optionally filter by user_id query: /api/orders?user_id=1)
export async function getOrders(req, res) {
  const { user_id } = req.query;

  try {
    let sql = `
      SELECT o.id, o.user_id, u.name as user_name, u.email as user_email, o.total_price, o.status, o.created_at
      FROM \`Order\` o
      LEFT JOIN \`User\` u ON o.user_id = u.id
    `;
    const args = [];

    if (user_id) {
      sql += ` WHERE o.user_id = ?`;
      args.push(user_id);
    }

    sql += ` ORDER BY o.id DESC`;

    const ordersResult = await db.execute({ sql, args });
    const orders = ordersResult.rows;

    // Fetch line items for each order
    for (const order of orders) {
      const itemsResult = await db.execute({
        sql: `SELECT op.product_id, op.quantity, p.name as product_name, p.price as unit_price, p.image_url
              FROM \`Order_Product\` op
              JOIN \`Product\` p ON op.product_id = p.id
              WHERE op.order_id = ?`,
        args: [order.id],
      });
      order.products = itemsResult.rows;
    }

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
}

// POST /api/orders (Checkout / Do Order)
export async function createOrder(req, res) {
  const { user_id, products } = req.body;

  if (!user_id || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Fields 'user_id' and an array of 'products' [{product_id, quantity}] are required.",
    });
  }

  try {
    // 1. Verify User exists
    const userCheck = await db.execute({
      sql: "SELECT id, name, email FROM `User` WHERE id = ?",
      args: [user_id],
    });

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `User with ID ${user_id} not found. Please log in first.`,
      });
    }

    // 2. Validate product availability & compute total
    let totalPrice = 0;
    const itemsToProcess = [];

    for (const item of products) {
      const prodResult = await db.execute({
        sql: "SELECT id, name, price, stock FROM `Product` WHERE id = ?",
        args: [item.product_id],
      });

      if (prodResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Product ID ${item.product_id} not found.`,
        });
      }

      const product = prodResult.rows[0];
      const quantity = Math.max(1, Number(item.quantity) || 1);

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${quantity}.`,
        });
      }

      totalPrice += Number(product.price) * quantity;
      itemsToProcess.push({
        productId: product.id,
        name: product.name,
        unitPrice: Number(product.price),
        quantity,
      });
    }

    // 3. Create Order record
    const orderResult = await db.execute({
      sql: `INSERT INTO \`Order\` (user_id, total_price, status) VALUES (?, ?, 'pending') RETURNING *`,
      args: [user_id, totalPrice],
    });

    const newOrderId = orderResult.rows[0]?.id || Number(orderResult.lastInsertRowid);

    // 4. Insert into Order_Product & deduct stock
    for (const item of itemsToProcess) {
      await db.execute({
        sql: `INSERT INTO \`Order_Product\` (order_id, product_id, quantity) VALUES (?, ?, ?)`,
        args: [newOrderId, item.productId, item.quantity],
      });

      await db.execute({
        sql: `UPDATE \`Product\` SET stock = stock - ? WHERE id = ?`,
        args: [item.quantity, item.productId],
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        id: newOrderId,
        user_id,
        user_name: userCheck.rows[0].name,
        total_price: totalPrice,
        status: "pending",
        created_at: new Date().toISOString(),
        products: itemsToProcess,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to place order in Turso database",
    });
  }
}

// PUT /api/orders/:id/status
export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: "Field 'status' is required.",
    });
  }

  try {
    const result = await db.execute({
      sql: `UPDATE \`Order\` SET status = ? WHERE id = ? RETURNING *`,
      args: [status, id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Order with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update order status",
    });
  }
}

// DELETE /api/orders/:id
export async function deleteOrder(req, res) {
  const { id } = req.params;

  try {
    const result = await db.execute({
      sql: "DELETE FROM `Order` WHERE id = ?",
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: `Order with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order ${id} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to delete order",
    });
  }
}
