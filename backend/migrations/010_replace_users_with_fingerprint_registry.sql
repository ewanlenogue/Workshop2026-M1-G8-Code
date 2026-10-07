CREATE TABLE IF NOT EXISTS fingerprint_registry (
    fingerprint_id INT UNSIGNED PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO fingerprint_registry (fingerprint_id)
SELECT CAST(fingerprint_id AS UNSIGNED)
FROM users
WHERE fingerprint_id IS NOT NULL
  AND fingerprint_id REGEXP '^[0-9]+$'
  AND CAST(fingerprint_id AS UNSIGNED) > 0;

DROP TABLE IF EXISTS users;
