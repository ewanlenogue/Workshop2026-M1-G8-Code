const db = require("../config/database");

const Telemetry = {
  async create(data) {
    const {
      device_id,
      temperature,
      humidity,
      air_raw,
      air_level,
      rssi,
      uptime_s
    } = data;

    const [result] = await db.execute(
      `INSERT INTO telemetry
       (device_id, temperature, humidity, air_raw, air_level, rssi, uptime_s)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        device_id,
        temperature,
        humidity,
        air_raw,
        air_level,
        rssi,
        uptime_s
      ]
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

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [rows] = await db.execute(
      `SELECT
        id,
        device_id,
        temperature,
        humidity,
        air_raw,
        air_level,
        rssi,
        uptime_s,
        received_at
       FROM telemetry
       ${whereClause}
       ORDER BY received_at DESC
       LIMIT ?`,
      [...values, filters.limit || 100]
    );

    return rows;
  }
};

module.exports = Telemetry;
