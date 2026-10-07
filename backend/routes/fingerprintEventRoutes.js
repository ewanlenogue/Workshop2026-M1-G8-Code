const express = require("express");

const {
  createFingerprintEvent,
  getFingerprintEvents
} = require("../controllers/fingerprintEventController");

const router = express.Router();

router.post("/", createFingerprintEvent);
router.get("/", getFingerprintEvents);

module.exports = router;
