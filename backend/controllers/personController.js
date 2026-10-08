const getPersonCount = (req, res) => {
  const { nombrePersonne } = req.body || {};

  if (!Number.isInteger(nombrePersonne) || nombrePersonne < 0) {
    return res.status(400).json({
      message: "nombrePersonne doit être un entier positif ou nul"
    });
  }

  return res.json({
    nombrePersonne
  });
};

module.exports = {
  getPersonCount
};
