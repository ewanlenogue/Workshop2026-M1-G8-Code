const db = require("../config/database");

const User = {
  async findAll() {
    const [rows] = await db.query(
      "SELECT id, username, email, first_name, last_name, photo, role, fingerprint_id, status, created_at FROM users"
    );

    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT id, username, email, first_name, last_name, photo, role, fingerprint_id, status, created_at FROM users WHERE id = ?",
      [id]
    );

    return rows[0];
  },

  async findByFingerprint(fingerprintId) {
    const [rows] = await db.query(
      "SELECT id, username, email, first_name, last_name, photo, role, fingerprint_id, status FROM users WHERE fingerprint_id = ?",
      [fingerprintId]
    );

    return rows[0];
  },

  async create(user) {
    const [result] = await db.query(
      `INSERT INTO users
      (username, email, password, first_name, last_name, photo, role, fingerprint_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.username,
        user.email,
        user.password,
        user.first_name,
        user.last_name,
        user.photo || null,
        user.role || "USER",
        user.fingerprint_id
      ]
    );

    return result.insertId;
  }
};

module.exports = User;