const express = require("express");

const { createTelemetry } = require("../controllers/telemetryController");

const router = express.Router();

router.post("/", createTelemetry);

module.exports = router;
