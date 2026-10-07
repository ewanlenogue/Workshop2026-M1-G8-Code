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
  }
};

module.exports = Telemetry;
