const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur récupération utilisateurs"
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur récupération utilisateur"
    });
  }
};

const getUserByFingerprint = async (req, res) => {
  try {
    const user = await User.findByFingerprint(
      req.params.fingerprintId
    );

    if (!user) {
      return res.status(404).json({
        message: "Empreinte non reconnue"
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur recherche empreinte"
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  getUserByFingerprint
};