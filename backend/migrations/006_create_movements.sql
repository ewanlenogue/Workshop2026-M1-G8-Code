CREATE TABLE IF NOT EXISTS movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    motion BOOLEAN NOT NULL,
    event_timestamp BIGINT UNSIGNED NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_movements_device_timestamp (device_id, event_timestamp),
    INDEX idx_movements_received_at (received_at)
) ENGINE=InnoDB;
