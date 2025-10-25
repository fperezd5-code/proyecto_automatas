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
      
      // MODIFICACIÓN: Limpiamos la imagen de entrada ANTES de validarla y usarla
      const imagenLimpia = this.stripBase64Prefix(imagen_facial);

      // Validar que no esté vacía después de limpiar
      if (!imagenLimpia) {
         return res.status(400).json(
           ApiResponse.validationError('La imagen facial es inválida o está vacía')
         );
      }

      // Validar formato base64 básico (ahora sobre la imagen limpia)
      if (!this.isValidBase64(imagenLimpia)) {
        return res.status(400).json(
          ApiResponse.validationError('La imagen debe estar en formato Base64 puro')
        );
      }

      // Buscar coincidencia en la base de datos (usando la imagen limpia)
      const resultado = await facialService.buscarCoincidenciaFacial(imagenLimpia);

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
   * NUEVA FUNCIÓN HELPER
   * Limpia el prefijo 'data:image/...' de una cadena Base64
   */
  stripBase64Prefix(str) {
    if (typeof str !== 'string') return '';
    if (str.includes(',')) {
      return str.split(',')[1];
    }
    return str;
  }

  /**
   * Valida si una cadena es Base64 válida
   * (MODIFICADO para validar la cadena pura)
   */
  isValidBase64(str) {
    try {
      // Regex básico para validar Base64
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;
      // Ya no necesitamos limpiar 'str' aquí, porque lo hicimos antes
      return base64Regex.test(str) && str.length > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new FacialController();