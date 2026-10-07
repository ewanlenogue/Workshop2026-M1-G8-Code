CREATE TABLE IF NOT EXISTS telemetry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    air_raw INT UNSIGNED NOT NULL,
    air_level VARCHAR(30) NOT NULL,
    rssi SMALLINT NOT NULL,
    uptime_s INT UNSIGNED NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_telemetry_device_received (device_id, received_at)
) ENGINE=InnoDB;
