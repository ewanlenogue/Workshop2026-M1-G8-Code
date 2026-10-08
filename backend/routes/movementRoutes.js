const express = require("express");

const {
  createMovement,
  getMovements
} = require("../controllers/movementController");

const router = express.Router();

router.post("/", createMovement);
router.get("/", getMovements);

module.exports = router;
