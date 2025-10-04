const ApiResponse = require('../utils/response');

const validateUsuarioRegistro = (req, res, next) => {
  const { 
    usuario, 
    email, 
    nombre_completo, 
    password, 
    telefono,
    imagen_referencia,
    notif_email,
    notif_whatsapp
  } = req.body;
  
  const errors = [];

  // Validar usuario
  if (!usuario || usuario.trim() === '') {
    errors.push({ field: 'usuario', message: 'El usuario es requerido' });
  } else if (usuario.length > 50) {
    errors.push({ field: 'usuario', message: 'El usuario no puede exceder 50 caracteres' });
  }

  // Validar email
  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'El email es requerido' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'El email no es válido' });
  } else if (email.length > 100) {
    errors.push({ field: 'email', message: 'El email no puede exceder 100 caracteres' });
  }

  // Validar nombre completo
  if (!nombre_completo || nombre_completo.trim() === '') {
    errors.push({ field: 'nombre_completo', message: 'El nombre completo es requerido' });
  } else if (nombre_completo.length > 150) {
    errors.push({ field: 'nombre_completo', message: 'El nombre completo no puede exceder 150 caracteres' });
  }

  // Validar password
  if (!password || password.trim() === '') {
    errors.push({ field: 'password', message: 'La contraseña es requerida' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Validar imagen de referencia
  if (!imagen_referencia || imagen_referencia.trim() === '') {
    errors.push({ field: 'imagen_referencia', message: 'La imagen de referencia es obligatoria' });
  }

  // Validar métodos de notificación
  const emailNotif = notif_email === true || notif_email === 1;
  const whatsappNotif = notif_whatsapp === true || notif_whatsapp === 1;

  if (!emailNotif && !whatsappNotif) {
    errors.push({ 
      field: 'notificaciones', 
      message: 'Debe seleccionar al menos un método de notificación (email o whatsapp)' 
    });
  }

  // Validar teléfono si WhatsApp está activo
  if (whatsappNotif) {
    if (!telefono || telefono.trim() === '') {
      errors.push({ 
        field: 'telefono', 
        message: 'El teléfono es obligatorio para notificaciones por WhatsApp' 
      });
    } else if (telefono.length > 20) {
      errors.push({ field: 'telefono', message: 'El teléfono no puede exceder 20 caracteres' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json(
      ApiResponse.validationError('Errores de validación', errors)
    );
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'El email es requerido' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'El email no es válido' });
  }

  if (!password || password.trim() === '') {
    errors.push({ field: 'password', message: 'La contraseña es requerida' });
  }

  if (errors.length > 0) {
    return res.status(400).json(
      ApiResponse.validationError('Errores de validación', errors)
    );
  }

  next();
};

module.exports = {
  validateUsuarioRegistro,
  validateLogin
};