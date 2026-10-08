const Movement = require("../models/Movement");

const createMovement = async (req, res) => {
  const {
    device_id,
    motion,
    timestamp
  } = req.body || {};

  const validPayload =
    typeof device_id === "string" &&
    device_id.trim().length > 0 &&
    typeof motion === "boolean" &&
    Number.isInteger(timestamp) &&
    timestamp >= 0;

  if (!validPayload) {
    return res.status(400).json({
      message:
        "device_id, motion et timestamp sont obligatoires et doivent respecter les types attendus"
    });
  }

  try {
    const id = await Movement.create({
      device_id: device_id.trim(),
      motion,
      timestamp
    });

    return res.status(201).json({
      message: "Mouvement enregistré",
      id
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur lors de l'enregistrement du mouvement"
    });
  }
};

const getMovements = async (req, res) => {
  const { device_id, from, to, limit } = req.query;
  const parsedFrom = from === undefined ? undefined : Number(from);
  const parsedTo = to === undefined ? undefined : Number(to);
  const parsedLimit = limit === undefined ? 100 : Number(limit);

  const validDevice =
    device_id === undefined ||
    (typeof device_id === "string" && device_id.trim().length > 0);
  const validRange =
    (parsedFrom === undefined ||
      (Number.isInteger(parsedFrom) && parsedFrom >= 0)) &&
    (parsedTo === undefined ||
      (Number.isInteger(parsedTo) && parsedTo >= 0)) &&
    (parsedFrom === undefined ||
      parsedTo === undefined ||
      parsedFrom <= parsedTo);
  const validLimit =
    Number.isInteger(parsedLimit) && parsedLimit >= 1 && parsedLimit <= 1000;

  if (!validDevice || !validRange || !validLimit) {
    return res.status(400).json({
      message:
        "Les paramètres device_id, from, to et limit doivent respecter les formats attendus"
    });
  }

  try {
    const movements = await Movement.findAll({
      device_id: device_id?.trim(),
      from: parsedFrom,
      to: parsedTo,
      limit: parsedLimit
    });

    return res.json(movements);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur lors de la récupération des mouvements"
    });
  }
};

module.exports = {
  createMovement,
  getMovements
};
