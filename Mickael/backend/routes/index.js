const express = require("express");

const sensorRoutes = require("./sensorRoutes");
const fingerprintRoutes = require("./fingerprintRoutes");
const actuatorRoutes = require("./actuatorRoutes");

const router = express.Router();

router.use("/sensors", sensorRoutes);
router.use("/fingerprints", fingerprintRoutes);
router.use("/actuators", actuatorRoutes);

module.exports = router;