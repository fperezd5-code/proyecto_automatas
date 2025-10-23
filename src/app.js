const express = require('express');
const cors = require('cors');

// Rutas
const healthRoutes = require('./routes/healthRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const qrUsuarioRoutes = require('./routes/qrUsuarioRoutes');
const facialRoutes = require('./routes/facialRoutes');

// Crear instancia de Express
const app = express();

// ========================================
// CONFIGURACIÓN DE CORS
// ========================================
const corsOptions = {
  origin: '*', // Permitir todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'], // Headers permitidos
  credentials: true, // Permitir cookies / credenciales
  optionsSuccessStatus: 200 // Respuesta para navegadores antiguos
};

app.use(cors(corsOptions));

// ========================================
// MIDDLEWARES
// ========================================

// IMPORTANTE: Aumentar límite de JSON para imágenes Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========================================
// ROUTES
// ========================================
app.use('/api', healthRoutes); // Ruta de salud
app.use('/api/usuarios', usuarioRoutes); // Rutas de usuario
app.use('/api/qrusuario', qrUsuarioRoutes); // Rutas de QR de usuario
app.use('/api/facial', facialRoutes); // Rutas de verificación facial

// ========================================
// RUTA RAÍZ
// ========================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      usuarios: '/api/usuarios',
      qrusuario: '/api/qrusuario'
    }
  });
});

// ========================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ========================================
app.use((req, res) => {
  res.status(404).json({ 
    data: null,
    status: 404,
    message: 'Ruta no encontrada'
  });
});

module.exports = app;