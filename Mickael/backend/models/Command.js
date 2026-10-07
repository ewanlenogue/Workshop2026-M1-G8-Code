const db = require("../config/database");

const Command = {
  // Récupérer toutes les commandes
  async findAll() {
    const [rows] = await db.query(
      "SELECT * FROM commands ORDER BY created_at DESC"
    );

    return rows;
  },

  // Récupérer une commande par son ID
  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM commands WHERE id = ?",
      [id]
    );

    return rows[0];
  },

  // Créer une commande
  async create(command) {
    const [result] = await db.query(
      `INSERT INTO commands
      (
        action_id,
        motor,
        auto_mode,
        servo,
        unlock_door,
        led,
        alarm_off,
        message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        command.action_id,
        command.motor,
        command.auto_mode,
        command.servo,
        command.unlock_door,
        command.led,
        command.alarm_off,
        command.message
      ]
    );

    return result.insertId;
  },

  // Modifier une commande
  async update(id, command) {
    const [result] = await db.query(
      `UPDATE commands
       SET
         motor = ?,
         auto_mode = ?,
         servo = ?,
         unlock_door = ?,
         led = ?,
         alarm_off = ?,
         message = ?
       WHERE id = ?`,
      [
        command.motor,
        command.auto_mode,
        command.servo,
        command.unlock_door,
        command.led,
        command.alarm_off,
        command.message,
        id
      ]
    );

    return result.affectedRows;
  },

  // Supprimer une commande
  async delete(id) {
    const [result] = await db.query(
      "DELETE FROM commands WHERE id = ?",
      [id]
    );

    return result.affectedRows;
  }
};

module.exports = Command;