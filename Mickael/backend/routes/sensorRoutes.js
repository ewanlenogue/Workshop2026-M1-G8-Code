const express = require("express");

const {
  createSensor,
  getSensors,
  getSensorById
} = require("../controllers/sensorController");

const router = express.Router();

router.post("/", createSensor);
router.get("/", getSensors);
router.get("/:id", getSensorById);

module.exports = router;
