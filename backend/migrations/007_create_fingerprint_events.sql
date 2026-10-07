CREATE TABLE IF NOT EXISTS fingerprint_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    fingerprint_id INT UNSIGNED NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fingerprint_events_device_received (device_id, received_at),
    INDEX idx_fingerprint_events_fingerprint (fingerprint_id)
) ENGINE=InnoDB;
