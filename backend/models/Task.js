const pool = require("../db");

class Task {
  static async create(userId, title, description, priority, category) {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, priority, category)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, description, priority, category],
    );
    return result.rows[0];
  }

  static async findAllByUser(userId) {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return result.rows;
  }

  static async findByIdAndUser(id, userId) {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return result.rows[0];
  }

  static async update(id, userId, fields) {
    const { title, description, status, priority, category } = fields;
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           category = COALESCE($5, category)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, description, status, priority, category, id, userId],
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );
    return result.rows[0];
  }
}

module.exports = Task;
