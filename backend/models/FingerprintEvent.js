const db = require("../config/database");

const FingerprintEvent = {
  async isRegistered(fingerprintId) {
    if (fingerprintId === null) {
      return false;
    }

    const [rows] = await db.execute(
      `SELECT id
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
  }
};

module.exports = FingerprintEvent;
