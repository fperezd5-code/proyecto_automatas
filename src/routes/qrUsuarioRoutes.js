const express = require('express');
const router = express.Router();
const qrUsuarioController = require('../controllers/qrUsuarioController');
const ApiResponse = require('../utils/response');

// Generar QR
router.post('/', async (req, res) => {
  try {
    await qrUsuarioController.generarQr(req, res);
  } catch (error) {
    console.error('Error en ruta /api/qrusuario:', error);
    return res.status(500).json(ApiResponse.error('Error interno del servidor', 500));
  }
});

// Validar QR y abrir sesión
router.post('/validar', async (req, res) => {
  try {
    await qrUsuarioController.validarQr(req, res);
  } catch (error) {
    console.error('Error en ruta /api/qrusuario/validar:', error);
    return res.status(500).json(ApiResponse.error('Error interno del servidor', 500));
  }
});

module.exports = router;