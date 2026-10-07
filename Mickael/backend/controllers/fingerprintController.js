const Fingerprint = require("../models/FingerPrint");

const createFingerprint = async (req, res) => {

  try {

    const {
      device,
      event,
      userId,
      confidence
    } = req.body;

    if (!device || !event) {
      return res.status(400).json({
        message: "device et event sont obligatoires"
      });
    }

    const id = await Fingerprint.create({
      device,
      event,
      userId,
      confidence
    });

    res.status(201).json({
      message: "Événement d'empreinte enregistré",
      id
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


const getFingerprints = async (req, res) => {

  try {

    const data = await Fingerprint.findAll();

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


const getFingerprintById = async (req, res) => {

  try {

    const data = await Fingerprint.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        message: "Événement introuvable"
      });
    }

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


module.exports = {
  createFingerprint,
  getFingerprints,
  getFingerprintById
};