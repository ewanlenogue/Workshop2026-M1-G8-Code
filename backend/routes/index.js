const express = require("express");

const telemetryRoutes = require("./telemetryRoutes");
const movementRoutes = require("./movementRoutes");
const fingerprintEventRoutes = require("./fingerprintEventRoutes");
const personRoutes = require("./personRoutes");

const router = express.Router();

router.use("/v1/telemetrie", telemetryRoutes);
router.use("/v1/mouvement", movementRoutes);
router.use("/v1/empreinte", fingerprintEventRoutes);
router.use("/v1/personnes", personRoutes);

module.exports = router;