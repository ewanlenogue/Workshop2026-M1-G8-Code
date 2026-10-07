const express = require("express");

const {
  createFingerprintEvent
} = require("../controllers/fingerprintEventController");

const router = express.Router();

router.post("/", createFingerprintEvent);

module.exports = router;
