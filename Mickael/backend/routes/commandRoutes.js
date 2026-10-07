const express = require("express");

const {
  createCommand,
  getCommands,
  getCommandById
} = require("../controllers/commandController");

const router = express.Router();

router.post("/", createCommand);
router.get("/", getCommands);
router.get("/:id", getCommandById);

module.exports = router;
