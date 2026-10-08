require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = path.join(__dirname, "migrations");

  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const [rows] = await connection.query(
      "SELECT * FROM migrations WHERE filename = ?",
      [file]
    );

    if (rows.length > 0) {
      console.log(`✓ Déjà exécutée : ${file}`);
      continue;
    }

    const sql = fs.readFileSync(
      path.join(migrationsDir, file),
      "utf8"
    );

    await connection.query(sql);

    await connection.query(
      "INSERT INTO migrations (filename) VALUES (?)",
      [file]
    );

    console.log(`✓ Migration exécutée : ${file}`);
  }

  await connection.end();

  console.log("Migration terminée.");
}

migrate().catch(error => {
  console.error("❌ Erreur migration :", error);
  process.exit(1);
});