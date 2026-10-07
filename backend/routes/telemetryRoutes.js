const express = require("express");

const {
  createTelemetry,
  getTelemetry
} = require("../controllers/telemetryController");

const router = express.Router();

router.post("/", createTelemetry);
router.get("/", getTelemetry);

module.exports = router;
