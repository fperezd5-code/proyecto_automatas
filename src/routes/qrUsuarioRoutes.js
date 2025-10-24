/* Archivo: src/routes/qrUsuarioRoutes.js */

const express = require('express');
const router = express.Router();
// Este require apunta al controlador
const qrUsuarioController = require('../controllers/qrUsuarioController');

// POST /api/qrusuario (o la ruta que hayas definido en tu app principal)
// Endpoint para generar un nuevo código QR.
router.post('/', qrUsuarioController.generarQr);

// POST /api/qrusuario/validar (o la ruta que hayas definido)
// Endpoint para validar un QR e iniciar sesión.
router.post('/validar', qrUsuarioController.validarQr);

module.exports = router;