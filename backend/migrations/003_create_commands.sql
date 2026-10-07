CREATE TABLE IF NOT EXISTS commands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_id VARCHAR(50),
    motor INT,
    auto_mode BOOLEAN,
    servo INT,
    unlock_door BOOLEAN,
    led VARCHAR(10),
    alarm_off BOOLEAN,
    message VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);