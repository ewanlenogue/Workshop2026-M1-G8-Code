const db = require("../config/database");

const Sensor = {

  create: async (data) => {
    const { device, temp, hum, gaz, pir } = data;

    const [result] = await db.execute(
      `INSERT INTO sensors
       (device, temp, hum, gaz, pir)
       VALUES (?, ?, ?, ?, ?)`,
      [device, temp, hum, gaz, pir]
    );

    return result.insertId;
  },

  findAll: async () => {
    const [rows] = await db.execute(
      `SELECT * FROM sensors
       ORDER BY created_at DESC`
    );

    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute(
      `SELECT * FROM sensors WHERE id = ?`,
      [id]
    );

    return rows[0];
  }

};

module.exports = Sensor;