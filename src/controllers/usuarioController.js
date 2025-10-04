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
        telefono: req.body.telefono
      };

      const result = await usuarioService.registrarUsuario(datosUsuario);

      if (result.success) {
        // Usuario registrado exitosamente
        const response = ApiResponse.success(
          { 
            id: result.resultado,
            usuario: datosUsuario.usuario,
            email: datosUsuario.email
          },
          result.mensaje,
          201
        );
        return res.status(201).json(response);
      } else {
        // Error de validación del stored procedure (email o usuario duplicado)
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

  // Ejemplo de otro endpoint
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