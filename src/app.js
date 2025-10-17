const express = require('express');
const cors = require('cors');

// Importación de rutas
const healthRoutes = require('./routes/healthRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const qrUsuarioRoutes = require('./routes/qrUsuarioRoutes');
const ApiResponse = require('./utils/response');

// Crear instancia de Express
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas de la API ---
app.use('/api', healthRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/qrusuario', qrUsuarioRoutes);

// --- Ruta Raíz ---
app.get('/', (req, res) => {
  res.json({ message: 'API de Autenticación por QR está funcionando.' });
});

// --- Manejo de Rutas no Encontradas (404) ---
app.use((req, res, next) => {
  res.status(404).json(ApiResponse.error('Ruta no encontrada.', 404));
});

module.exports = app;

