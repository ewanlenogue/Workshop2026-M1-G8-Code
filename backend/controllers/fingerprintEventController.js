const FingerprintEvent = require("../models/FingerprintEvent");

const createFingerprintEvent = async (req, res) => {
  const {
    device_id,
    fingerprint_id
  } = req.body || {};

  const normalizedFingerprintId =
    fingerprint_id === "" || fingerprint_id === undefined
      ? null
      : fingerprint_id;

  const validPayload =
    typeof device_id === "string" &&
    device_id.trim().length > 0 &&
    (normalizedFingerprintId === null ||
      (Number.isInteger(normalizedFingerprintId) &&
        normalizedFingerprintId > 0));

  if (!validPayload) {
    return res.status(400).json({
      message:
        "device_id et fingerprint_id sont obligatoires et doivent respecter les types attendus"
    });
  }

  try {
    const registered = await FingerprintEvent.isRegistered(
      normalizedFingerprintId
    );

    const id = await FingerprintEvent.create({
      device_id: device_id.trim(),
      fingerprint_id: normalizedFingerprintId
    });

    return res.status(201).json({
      message: "Empreinte digitale enregistrée",
      id,
      intrus: !registered
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur lors de l'enregistrement de l'empreinte digitale"
    });
  }
};

const getFingerprintEvents = async (req, res) => {
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
    const events = await FingerprintEvent.findAll({
      device_id: device_id?.trim(),
      limit: parsedLimit
    });

    return res.json(events);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur lors de la récupération des empreintes"
    });
  }
};

module.exports = {
  createFingerprintEvent,
  getFingerprintEvents
};
