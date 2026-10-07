const express = require("express");

const sensorRoutes = require("./sensorRoutes");
const fingerprintRoutes = require("./fingerprintRoutes");
const commandRoutes = require("./commandRoutes");

const router = express.Router();

router.use("/sensors", sensorRoutes);
router.use("/fingerprints", fingerprintRoutes);
router.use("/commands", commandRoutes);

module.exports = router;