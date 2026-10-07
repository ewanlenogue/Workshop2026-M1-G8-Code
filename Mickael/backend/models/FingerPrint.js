const db = require("../config/database");

const Fingerprint = {

  create: async (data) => {

    const {
      device,
      event,
      userId,
      confidence
    } = data;

    const [result] = await db.execute(
      `INSERT INTO fingerprints
       (device, event, user_id, confidence)
       VALUES (?, ?, ?, ?)`,
      [
        device,
        event,
        userId,
        confidence
      ]
    );

    return result.insertId;
  },

  findAll: async () => {

    const [rows] = await db.execute(
      `SELECT
        id,
        device,
        event,
        user_id AS userId,
        confidence,
        created_at
       FROM fingerprints
       ORDER BY created_at DESC`
    );

    return rows;
  },

  findById: async (id) => {

    const [rows] = await db.execute(
      `SELECT
        id,
        device,
        event,
        user_id AS userId,
        confidence,
        created_at
       FROM fingerprints
       WHERE id = ?`,
      [id]
    );

    return rows[0];
  }

};

module.exports = Fingerprint;