const Telemetry = require("../models/Telemetry");

const isFiniteNumber = value =>
  typeof value === "number" && Number.isFinite(value);

const isNonNegativeInteger = value =>
  Number.isInteger(value) && value >= 0;

const createTelemetry = async (req, res) => {
  const {
    device_id,
    temperature,
    humidity,
    air_raw,
    air_level,
    rssi,
    uptime_s
  } = req.body || {};

  const validPayload =
    typeof device_id === "string" &&
    device_id.trim().length > 0 &&
    isFiniteNumber(temperature) &&
    isFiniteNumber(humidity) &&
    isNonNegativeInteger(air_raw) &&
    typeof air_level === "string" &&
    air_level.trim().length > 0 &&
    Number.isInteger(rssi) &&
    isNonNegativeInteger(uptime_s);

  if (!validPayload) {
    return res.status(400).json({
      message:
        "device_id, temperature, humidity, air_raw, air_level, rssi et uptime_s sont obligatoires et doivent respecter les types attendus"
    });
  }

  try {
    const id = await Telemetry.create({
      device_id: device_id.trim(),
      temperature,
      humidity,
      air_raw,
      air_level: air_level.trim(),
      rssi,
      uptime_s
    });

    return res.status(201).json({
      message: "Télémétrie enregistrée",
      id
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur lors de l'enregistrement de la télémétrie"
    });
  }
};

const getTelemetry = async (req, res) => {
  const { device_id, limit } = req.query;
  const parsedLimit = limit === undefined ? 100 : Number(limit);
  const validDevice =
    device_id === undefined ||
    (typeof device_id === "string" && device_id.trim().length > 0);
  const validLimit =
    Number.isInteger(parsedLimit) && parsedLimit >= 1 && parsedLimit <= 1000;

  if (!validDevice || !validLimit) {
    return res.status(400).json({
      message:
        "Les paramètres device_id et limit doivent respecter les formats attendus"
    });
  }

  try {
    const telemetry = await Telemetry.findAll({
      device_id: device_id?.trim(),
      limit: parsedLimit
    });

    return res.json(telemetry);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur lors de la récupération de la télémétrie"
    });
  }
};

module.exports = {
  createTelemetry,
  getTelemetry
};
