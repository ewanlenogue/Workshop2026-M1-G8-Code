const Sensor = require("../models/Sensor");

const createSensor = async (req, res) => {
  try {

    const { device, temp, hum, gaz, pir } = req.body;

    if (!device) {
      return res.status(400).json({
        message: "device est obligatoire"
      });
    }

    const id = await Sensor.create({
      device,
      temp,
      hum,
      gaz,
      pir
    });

    res.status(201).json({
      message: "Données du capteur enregistrées",
      id
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


const getSensors = async (req, res) => {
  try {

    const sensors = await Sensor.findAll();

    res.json(sensors);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


const getSensorById = async (req, res) => {
  try {

    const sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        message: "Capteur introuvable"
      });
    }

    res.json(sensor);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};


module.exports = {
  createSensor,
  getSensors,
  getSensorById
};