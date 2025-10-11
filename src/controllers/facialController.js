const facialService = require('../services/facialService');
const ApiResponse = require('../utils/response');

class FacialController {
  /**
   * Endpoint para verificación facial
   * POST /api/facial/verificar
   */
  async verificarRostro(req, res) {
    try {
      const { imagen_facial } = req.body;

      // Validar que se envió la imagen
      if (!imagen_facial || imagen_facial.trim() === '') {
        return res.status(400).json(
          ApiResponse.validationError('La imagen facial es requerida')
        );
      }

      // Validar formato base64 básico
      if (!this.isValidBase64(imagen_facial)) {
        return res.status(400).json(
          ApiResponse.validationError('La imagen debe estar en formato Base64 válido')
        );
      }

      // Buscar coincidencia en la base de datos
      const resultado = await facialService.buscarCoincidenciaFacial(imagen_facial);

      if (resultado.coincide) {
        // Obtener datos completos del usuario y crear sesión
        const datosCompletos = await facialService.obtenerDatosLoginExitoso(resultado.usuario_id);

        return res.status(200).json(
          ApiResponse.success({
            resultado: datosCompletos.usuario_id,
            mensaje: datosCompletos.mensaje,
            session_token: datosCompletos.session_token,
            metodos_notificacion: datosCompletos.metodos_notificacion,
            autenticacion_facial: datosCompletos.autenticacion_facial
          }, 'Verificación facial exitosa')
        );
      } else {
        return res.status(404).json(
          ApiResponse.notFound('No se encontró coincidencia facial')
        );
      }

    } catch (error) {
      console.error('Error en verificación facial:', error);
      return res.status(500).json(
        ApiResponse.error('Error al procesar verificación facial', 500)
      );
    }
  }

  /**
   * Valida si una cadena es Base64 válida
   */
  isValidBase64(str) {
    try {
      // Regex básico para validar Base64
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;

      // Remover posible prefijo de data URL
      let base64String = str;
      if (str.includes(',')) {
        base64String = str.split(',')[1];
      }

      return base64Regex.test(base64String) && base64String.length > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new FacialController();