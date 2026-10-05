const users = [
  { id: 1, name: "Mickael", age: 25 },
  { id: 2, name: "John", age: 28 },
];

const getUsers = (req, res) => {
  res.json(users);
};

module.exports = {
  getUsers,
};