const express = require('express');
const router = express.Router();
const facialController = require('../controllers/facialController');

// Ruta para verificación facial
router.post('/verificar', facialController.verificarRostro.bind(facialController));

module.exports = router;