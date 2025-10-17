const express = require('express');
const router = express.Router();
const qrUsuarioController = require('../controllers/qrUsuarioController');

// Las rutas ya no necesitan su propio try-catch,
// ya que el controlador maneja los errores de forma centralizada.

// POST /api/qrusuario
// Endpoint para generar un nuevo código QR.
router.post('/', qrUsuarioController.generarQr);

// POST /api/qrusuario/validar
// Endpoint para validar un QR e iniciar sesión.
router.post('/validar', qrUsuarioController.validarQr);

module.exports = router;
