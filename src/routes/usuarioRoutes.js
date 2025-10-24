const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validateUsuarioRegistro, validateLogin } = require('../middlewares/validateRequest');

// Verifica que los métodos existan
console.log('usuarioController:', usuarioController);
console.log('registrarUsuario:', typeof usuarioController.registrarUsuario);
console.log('loginCorreo:', typeof usuarioController.loginCorreo);

// POST /api/usuarios/registro
router.post('/registro', validateUsuarioRegistro, usuarioController.registrarUsuario.bind(usuarioController));

// POST /api/usuarios/login
router.post('/login', validateLogin, usuarioController.loginCorreo.bind(usuarioController));

// GET /api/usuarios/:id
router.get('/:id', usuarioController.obtenerUsuario.bind(usuarioController));

module.exports = router;