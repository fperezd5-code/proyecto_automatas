const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validateUsuarioRegistro } = require('../middlewares/validateRequest');

// POST /api/usuarios/registro
router.post('/registro', validateUsuarioRegistro, usuarioController.registrarUsuario);

// GET /api/usuarios/:id
router.get('/:id', usuarioController.obtenerUsuario);

module.exports = router;