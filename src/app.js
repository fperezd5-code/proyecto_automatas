const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    data: null,
    status: 404,
    message: 'Ruta no encontrada'
  });
});

module.exports = app;