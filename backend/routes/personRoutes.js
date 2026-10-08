const express = require("express");

const { getPersonCount } = require("../controllers/personController");

const router = express.Router();

router.post("/", getPersonCount);

module.exports = router;
