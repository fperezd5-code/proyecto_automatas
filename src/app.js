const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// ========================================
// CONFIGURACIÓN DE CORS
// ========================================
const corsOptions = {
  origin: '*', // Permite todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Todos los métodos HTTP
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'], // Headers permitidos
  credentials: true, // Permite envío de cookies y credenciales
  optionsSuccessStatus: 200 // Para navegadores legacy
};

app.use(cors(corsOptions));

// ========================================
// MIDDLEWARES
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// ROUTES
// ========================================
app.use('/api', healthRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      usuarios: '/api/usuarios'
    }
  });
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