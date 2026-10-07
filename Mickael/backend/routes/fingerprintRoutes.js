const express = require("express");

const {
  createFingerprint,
  getFingerprints,
  getFingerprintById
} = require("../controllers/fingerprintController");

const router = express.Router();

router.post("/", createFingerprint);
router.get("/", getFingerprints);
router.get("/:id", getFingerprintById);

module.exports = router;