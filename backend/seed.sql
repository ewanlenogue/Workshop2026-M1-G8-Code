-- =========================================================
-- Sentinel-X — jeu de données de démonstration
-- Se limite aux données de l'appareil de démo pour pouvoir
-- être rejoué sans écraser les relevés d'un vrai boîtier.
--
-- Exécution :  npm run seed   (ou : mysql ... < seed.sql)
-- =========================================================

-- Empreintes autorisées -----------------------------------------------------
INSERT IGNORE INTO fingerprint_registry (fingerprint_id) VALUES (1), (2), (3);

-- Télémétrie : 1 relevé / heure sur 24h -------------------------------------
DELETE FROM telemetry        WHERE device_id = 'tourelle-esp8266';
DELETE FROM movements        WHERE device_id = 'tourelle-esp8266';
DELETE FROM fingerprint_events WHERE device_id = 'tourelle-esp8266';

INSERT INTO telemetry (device_id, temperature, humidity, air_raw, air_level, rssi, uptime_s, received_at) VALUES
  ('tourelle-esp8266', 24.20, 48.50, 210, 'Normal',   -62,  86400, '2026-10-06 18:00:00'),
  ('tourelle-esp8266', 22.80, 52.10, 235, 'Normal',   -64,  90000, '2026-10-06 19:00:00'),
  ('tourelle-esp8266', 21.40, 55.30, 260, 'Normal',   -66,  93600, '2026-10-06 20:00:00'),
  ('tourelle-esp8266', 20.10, 58.00, 245, 'Normal',   -65,  97200, '2026-10-06 21:00:00'),
  ('tourelle-esp8266', 19.30, 60.20, 270, 'Normal',   -68, 100800, '2026-10-06 22:00:00'),
  ('tourelle-esp8266', 18.60, 62.50, 255, 'Normal',   -67, 104400, '2026-10-06 23:00:00'),
  ('tourelle-esp8266', 18.10, 64.00, 280, 'Normal',   -70, 108000, '2026-10-07 00:00:00'),
  ('tourelle-esp8266', 17.60, 65.40, 300, 'Normal',   -69, 111600, '2026-10-07 01:00:00'),
  ('tourelle-esp8266', 17.20, 66.80, 340, 'Élevé',    -71, 115200, '2026-10-07 02:00:00'),
  ('tourelle-esp8266', 17.00, 67.50, 410, 'Élevé',    -72, 118800, '2026-10-07 03:00:00'),
  ('tourelle-esp8266', 16.80, 68.20, 780, 'Critique', -74, 122400, '2026-10-07 04:00:00'),
  ('tourelle-esp8266', 17.40, 66.00, 520, 'Élevé',    -73, 126000, '2026-10-07 05:00:00'),
  ('tourelle-esp8266', 18.50, 62.40, 330, 'Élevé',    -71, 129600, '2026-10-07 06:00:00'),
  ('tourelle-esp8266', 19.80, 58.90, 250, 'Normal',   -69, 133200, '2026-10-07 07:00:00'),
  ('tourelle-esp8266', 21.30, 55.20, 225, 'Normal',   -67, 136800, '2026-10-07 08:00:00'),
  ('tourelle-esp8266', 23.00, 51.70, 210, 'Normal',   -65, 140400, '2026-10-07 09:00:00'),
  ('tourelle-esp8266', 24.60, 48.80, 205, 'Normal',   -63, 144000, '2026-10-07 10:00:00'),
  ('tourelle-esp8266', 25.80, 46.50, 198, 'Normal',   -61, 147600, '2026-10-07 11:00:00'),
  ('tourelle-esp8266', 26.70, 44.90, 215, 'Normal',   -60, 151200, '2026-10-07 12:00:00'),
  ('tourelle-esp8266', 27.10, 44.20, 240, 'Normal',   -59, 154800, '2026-10-07 13:00:00'),
  ('tourelle-esp8266', 26.40, 45.60, 690, 'Critique', -62, 158400, '2026-10-07 14:00:00'),
  ('tourelle-esp8266', 25.20, 47.30, 380, 'Élevé',    -64, 162000, '2026-10-07 15:00:00'),
  ('tourelle-esp8266', 24.50, 49.10, 265, 'Normal',   -63, 165600, '2026-10-07 16:00:00'),
  ('tourelle-esp8266', 23.60, 50.80, 230, 'Normal',   -65, 169200, '2026-10-07 17:00:00'),
  ('tourelle-esp8266', 22.90, 52.40, 220, 'Normal',   -64, 172800, '2026-10-07 18:00:00');

-- Capteur PIR : mouvements détectés ----------------------------------------
INSERT INTO movements (device_id, motion, event_timestamp, received_at) VALUES
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-06 19:12:00'), '2026-10-06 19:12:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-06 22:47:00'), '2026-10-06 22:47:00'),
  ('tourelle-esp8266', 1, UNIX_TIMESTAMP('2026-10-07 03:58:00'), '2026-10-07 03:58:00'),
  ('tourelle-esp8266', 1, UNIX_TIMESTAMP('2026-10-07 04:02:00'), '2026-10-07 04:02:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-07 04:15:00'), '2026-10-07 04:15:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-07 07:31:00'), '2026-10-07 07:31:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-07 09:14:00'), '2026-10-07 09:14:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-07 11:40:00'), '2026-10-07 11:40:00'),
  ('tourelle-esp8266', 1, UNIX_TIMESTAMP('2026-10-07 13:58:00'), '2026-10-07 13:58:00'),
  ('tourelle-esp8266', 1, UNIX_TIMESTAMP('2026-10-07 14:01:00'), '2026-10-07 14:01:00'),
  ('tourelle-esp8266', 1, UNIX_TIMESTAMP('2026-10-07 14:06:00'), '2026-10-07 14:06:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-07 14:22:00'), '2026-10-07 14:22:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-07 15:35:00'), '2026-10-07 15:35:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-07 16:48:00'), '2026-10-07 16:48:00'),
  ('tourelle-esp8266', 0, UNIX_TIMESTAMP('2026-10-07 17:26:00'), '2026-10-07 17:26:00'),
  ('tourelle-esp8266', 1, UNIX_TIMESTAMP('2026-10-07 17:55:00'), '2026-10-07 17:55:00');

-- Lectures d'empreintes ------------------------------------------------------
-- fingerprint_id NULL ou inconnu du registre  =>  intrus = TRUE (côté API)
INSERT INTO fingerprint_events (device_id, fingerprint_id, received_at) VALUES
  ('tourelle-esp8266', 1,    '2026-10-06 18:40:00'),
  ('tourelle-esp8266', 2,    '2026-10-06 21:05:00'),
  ('tourelle-esp8266', NULL, '2026-10-07 04:03:00'),
  ('tourelle-esp8266', 7,    '2026-10-07 04:05:00'),
  ('tourelle-esp8266', 1,    '2026-10-07 07:12:00'),
  ('tourelle-esp8266', 3,    '2026-10-07 09:02:00'),
  ('tourelle-esp8266', 2,    '2026-10-07 12:30:00'),
  ('tourelle-esp8266', 1,    '2026-10-07 13:59:00'),
  ('tourelle-esp8266', NULL, '2026-10-07 14:00:00'),
  ('tourelle-esp8266', 9,    '2026-10-07 14:03:00'),
  ('tourelle-esp8266', 3,    '2026-10-07 17:40:00');
