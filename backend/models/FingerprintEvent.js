const db = require("../config/database");

const FingerprintEvent = {
  async isRegistered(fingerprintId) {
    if (fingerprintId === null) {
      return false;
    }

    const [rows] = await db.execute(
      `SELECT fingerprint_id
       FROM fingerprint_registry
       WHERE fingerprint_id = ?
       LIMIT 1`,
      [fingerprintId]
    );

    return rows.length > 0;
  },

  async create(data) {
    const { device_id, fingerprint_id } = data;

    const [result] = await db.execute(
      `INSERT INTO fingerprint_events
       (device_id, fingerprint_id)
       VALUES (?, ?)`,
      [device_id, fingerprint_id]
    );

    return result.insertId;
  },

  async findAll(filters = {}) {
    const conditions = [];
    const values = [];

    if (filters.device_id) {
      conditions.push("fe.device_id = ?");
      values.push(filters.device_id);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [rows] = await db.execute(
      `SELECT
        fe.id,
        fe.device_id,
        fe.fingerprint_id,
        fe.received_at,
        CASE
          WHEN fr.fingerprint_id IS NULL THEN TRUE
          ELSE FALSE
        END AS intrus
       FROM fingerprint_events fe
       LEFT JOIN fingerprint_registry fr
         ON fr.fingerprint_id = fe.fingerprint_id
       ${whereClause}
       ORDER BY fe.received_at DESC
       LIMIT ?`,
      [...values, filters.limit || 100]
    );

    return rows;
  }
};

module.exports = FingerprintEvent;
