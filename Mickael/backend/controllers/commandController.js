const Actuator = require("../models/Command");

const createCommand = async (req, res) => {

  try {

    const {
      id,
      target,
      action,
      duration
    } = req.body;

    if (!id || !target || !action) {
      return res.status(400).json({
        message: "id, target et action sont obligatoires"
      });
    }

    const databaseId = await Actuator.create({
      id,
      target,
      action,
      duration
    });

    res.status(201).json({
      message: "Commande enregistrée",
      id: databaseId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


const getCommands = async (req, res) => {

  try {

    const commands = await Actuator.findAll();

    res.json(commands);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


const getCommandById = async (req, res) => {

  try {

    const command = await Actuator.findById(req.params.id);

    if (!command) {
      return res.status(404).json({
        message: "Commande introuvable"
      });
    }

    res.json(actuator);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


module.exports = {
  createCommand,
  getCommands,
  getCommandById
};