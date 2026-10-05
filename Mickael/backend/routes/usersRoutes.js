const express = require("express");
const { getUsers } = require("../controllers/userControllers");

const router = express.Router();

router.get("/", getUsers);

module.exports = router;