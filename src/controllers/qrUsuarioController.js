const qrUsuarioService = require('../services/qrUsuarioService');
const ApiResponse = require('../utils/response');

class QrUsuarioController {
  async generarQr(req, res) {
    try {
      const { email, password } = req.body;
      const result = await qrUsuarioService.generarQrLogin(email, password);

      if (!result.success) {
        return res.status(401).json(ApiResponse.error(result.mensaje, 401));
      }
      return res.status(200).json(ApiResponse.success({ qr_base64: result.codigo_qr }, result.mensaje));
    } catch (error) {
      console.error('Error en qrUsuarioController.generarQr:', error);
      return res.status(500).json(ApiResponse.error('Error interno del servidor', 500));
    }
  }

  async validarQr(req, res) {
    try {
      const { qr_base64 } = req.body;
      if (!qr_base64) {
        return res.status(400).json(ApiResponse.validationError(
          'El código QR es obligatorio',
          [{ field: 'qr_base64', message: 'Campo requerido' }]
        ));
      }

      const result = await qrUsuarioService.validarQrLogin(qr_base64);

      if (!result.success) {
        return res.status(401).json(ApiResponse.error(result.mensaje, 401));
      }

      return res.status(200).json(ApiResponse.success({
        usuario: result.usuario,
        session_token: result.session_token
      }, result.mensaje));
    } catch (error) {
      console.error('Error en qrUsuarioController.validarQr:', error);
      return res.status(500).json(ApiResponse.error('Error interno del servidor', 500));
    }
  }
}

module.exports = new QrUsuarioController();