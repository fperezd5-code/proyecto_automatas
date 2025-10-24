const usuarioService = require('../services/usuarioService');
const ApiResponse = require('../utils/response');

class UsuarioController {
  async registrarUsuario(req, res) {
    try {
      const datosUsuario = {
        usuario: req.body.usuario,
        email: req.body.email,
        nombre_completo: req.body.nombre_completo,
        password: req.body.password,
        telefono: req.body.telefono,
        imagen_referencia: req.body.imagen_referencia,
        notif_email: req.body.notif_email,
        notif_whatsapp: req.body.notif_whatsapp
      };

      const result = await usuarioService.registrarUsuario(datosUsuario);

      if (result.success) {
        // Usuario registrado exitosamente
        const response = ApiResponse.success(
          { 
            id: result.resultado,
            usuario: datosUsuario.usuario,
            email: datosUsuario.email,
            nombre_completo: datosUsuario.nombre_completo,
            notificaciones: {
              email: datosUsuario.notif_email === true || datosUsuario.notif_email === 1,
              whatsapp: datosUsuario.notif_whatsapp === true || datosUsuario.notif_whatsapp === 1
            }
          },
          result.mensaje,
          201
        );
        return res.status(201).json(response);
      } else {
        // Error de validación del stored procedure
        const response = ApiResponse.validationError(
          result.mensaje,
          null
        );
        return res.status(400).json(response);
      }

    } catch (error) {
      console.error('Error en usuarioController.registrarUsuario:', error);
      
      const response = ApiResponse.error(
        'Error interno del servidor al registrar usuario',
        500
      );
      return res.status(500).json(response);
    }
  }

  async loginCorreo(req, res) {
    try {
      const { email, password } = req.body;

      const result = await usuarioService.loginConCorreo(email, password);

      if (result.success && result.session_token) {
        // Login exitoso - construir respuesta completa
        
        // Formatear métodos de notificación
        const notificaciones = result.metodosNotificacion.map(metodo => ({
          id: metodo.id,
          tipo: metodo.tipo_notificacion,
          destino: metodo.destino,
          activo: metodo.activo === 1
        }));

        // Preparar datos de autenticación facial
        const facial = result.autenticacionFacial ? {
          id: result.autenticacionFacial.id,
          imagen_referencia: result.autenticacionFacial.imagen_referencia,
          activo: result.autenticacionFacial.activo === 1
        } : null;

        const response = ApiResponse.success(
          {
            usuario: {
              id: result.datosUsuario.id,
              usuario: result.datosUsuario.usuario,
              email: result.datosUsuario.email,
              nombre_completo: result.datosUsuario.nombre_completo,
              telefono: result.datosUsuario.telefono,
              activo: result.datosUsuario.activo === 1
            },
            session: {
              token: result.session_token,
              fecha_login: new Date().toISOString()
            },
            notificaciones: notificaciones,
            autenticacion_facial: facial
          },
          result.mensaje,
          200
        );
        return res.status(200).json(response);
      } else {
        // Credenciales incorrectas o usuario inactivo
        const response = ApiResponse.error(
          result.mensaje,
          401
        );
        return res.status(401).json(response);
      }

    } catch (error) {
      console.error('Error en usuarioController.loginCorreo:', error);
      
      const response = ApiResponse.error(
        'Error interno del servidor al iniciar sesión',
        500
      );
      return res.status(500).json(response);
    }
  }

  async obtenerUsuario(req, res) {
    try {
      const { id } = req.params;
      
      const usuario = await usuarioService.obtenerUsuarioPorId(id);

      if (!usuario) {
        const response = ApiResponse.notFound('Usuario no encontrado');
        return res.status(404).json(response);
      }

      const response = ApiResponse.success(
        usuario,
        'Usuario obtenido exitosamente'
      );
      return res.status(200).json(response);

    } catch (error) {
      console.error('Error en usuarioController.obtenerUsuario:', error);
      
      const response = ApiResponse.error(
        'Error al obtener el usuario',
        500
      );
      return res.status(500).json(response);
    }
  }
}

module.exports = new UsuarioController();