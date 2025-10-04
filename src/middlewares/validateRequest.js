const ApiResponse = require('../utils/response');

const validateUsuarioRegistro = (req, res, next) => {
  const { usuario, email, nombre_completo, password, telefono } = req.body;
  const errors = [];

  // Validaciones
  if (!usuario || usuario.trim() === '') {
    errors.push({ field: 'usuario', message: 'El usuario es requerido' });
  } else if (usuario.length > 50) {
    errors.push({ field: 'usuario', message: 'El usuario no puede exceder 50 caracteres' });
  }

  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'El email es requerido' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'El email no es válido' });
  } else if (email.length > 100) {
    errors.push({ field: 'email', message: 'El email no puede exceder 100 caracteres' });
  }

  if (!nombre_completo || nombre_completo.trim() === '') {
    errors.push({ field: 'nombre_completo', message: 'El nombre completo es requerido' });
  } else if (nombre_completo.length > 150) {
    errors.push({ field: 'nombre_completo', message: 'El nombre completo no puede exceder 150 caracteres' });
  }

  if (!password || password.trim() === '') {
    errors.push({ field: 'password', message: 'La contraseña es requerida' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  if (telefono && telefono.length > 20) {
    errors.push({ field: 'telefono', message: 'El teléfono no puede exceder 20 caracteres' });
  }

  if (errors.length > 0) {
    return res.status(400).json(
      ApiResponse.validationError('Errores de validación', errors)
    );
  }

  next();
};

module.exports = {
  validateUsuarioRegistro
};