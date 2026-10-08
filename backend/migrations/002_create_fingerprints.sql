CREATE TABLE IF NOT EXISTS fingerprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device VARCHAR(50) NOT NULL,
    event VARCHAR(50) NOT NULL,
    user_id INT,
    confidence INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);