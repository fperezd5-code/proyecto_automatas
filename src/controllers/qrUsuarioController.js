const qrUsuarioService = require('../services/qrUsuarioService');
const ApiResponse = require('../utils/response');

class QrUsuarioController {
  /**
   * Maneja la solicitud para generar un QR validando los datos personales del usuario.
   */
  async generarQr(req, res) {
    try {
      const { usuario, nombre_completo, email, telefono } = req.body;

      if (!usuario || !nombre_completo || !email || !telefono) {
          return res.status(400).json(ApiResponse.validationError(
            'Todos los campos son obligatorios: usuario, nombre_completo, email, telefono.',
            []
          ));
      }

      const datosUsuario = { usuario, nombre_completo, email, telefono };
      const result = await qrUsuarioService.generarQrPorDatos(datosUsuario);

      if (!result.success) {
        return res.status(404).json(ApiResponse.error(result.mensaje, 404));
      }

      return res.status(200).json(ApiResponse.success({ qr_base64: result.codigo_qr }, result.mensaje));

    } catch (error) {
      console.error('Error en qrUsuarioController.generarQr:', error);
      return res.status(500).json(ApiResponse.error('Error interno del servidor.', 500));
    }
  }

  /**
   * Maneja la solicitud para validar un código QR e iniciar sesión.
   */
  async validarQr(req, res) {
    try {
      // 1. El controlador debe esperar 'qrData', no 'qr_base64'.
      const { qrData } = req.body; 
      if (!qrData) {
        return res.status(400).json(ApiResponse.validationError(
          'El contenido del QR (qrData) es obligatorio.',
          [{ field: 'qrData', message: 'Este campo es requerido.' }]
        ));
      }

      // 2. Se pasa el token (qrData) al servicio de validación.
      const result = await qrUsuarioService.validarQrLogin(qrData);

      if (!result.success) {
        return res.status(401).json(ApiResponse.error(result.mensaje, 401));
      }

      return res.status(200).json(ApiResponse.success({
        usuario: result.usuario,
        session_token: result.session_token
      }, result.mensaje));

    } catch (error) {
      console.error('Error en qrUsuarioController.validarQr:', error);
      return res.status(500).json(ApiResponse.error('Error interno del servidor.', 500));
    }
  }
}

module.exports = new QrUsuarioController();

