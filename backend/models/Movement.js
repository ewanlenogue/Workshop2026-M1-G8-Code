const db = require("../config/database");

const Movement = {
  async create(data) {
    const { device_id, motion, timestamp } = data;

    const [result] = await db.execute(
      `INSERT INTO movements
       (device_id, motion, event_timestamp)
       VALUES (?, ?, ?)`,
      [device_id, motion, timestamp]
    );

    return result.insertId;
  },

  async findAll(filters = {}) {
    const conditions = [];
    const values = [];

    if (filters.device_id) {
      conditions.push("device_id = ?");
      values.push(filters.device_id);
    }

    if (filters.from !== undefined) {
      conditions.push("event_timestamp >= ?");
      values.push(filters.from);
    }

    if (filters.to !== undefined) {
      conditions.push("event_timestamp <= ?");
      values.push(filters.to);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [rows] = await db.execute(
      `SELECT
        id,
        device_id,
        motion,
        event_timestamp AS timestamp,
        received_at
       FROM movements
       ${whereClause}
       ORDER BY event_timestamp DESC
       LIMIT ?`,
      [...values, filters.limit || 100]
    );

    return rows;
  }
};

module.exports = Movement;
