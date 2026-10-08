const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const indexRoutes = require('./routes');

// Middleware to parse JSON requests
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', indexRoutes);

// Sample route 
app.get('/', (req, res) => {
  res.send('Hello !');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

