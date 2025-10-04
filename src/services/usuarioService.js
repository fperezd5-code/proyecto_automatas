const { pool } = require('../config/database');

class UsuarioService {
  async registrarUsuario(datosUsuario) {
    const connection = await pool.getConnection();
    
    try {
      const { usuario, email, nombre_completo, password, telefono } = datosUsuario;

      // Llamar al stored procedure
      const [results] = await connection.query(
        'CALL sp_registrar_usuario(?, ?, ?, ?, ?, @p_resultado, @p_mensaje)',
        [usuario, email, nombre_completo, password, telefono || null]
      );

      // Obtener los valores de salida
      const [outputParams] = await connection.query(
        'SELECT @p_resultado AS resultado, @p_mensaje AS mensaje'
      );

      const { resultado, mensaje } = outputParams[0];

      return {
        success: resultado > 0,
        resultado: resultado,
        mensaje: mensaje
      };

    } catch (error) {
      console.error('Error en usuarioService.registrarUsuario:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Ejemplo de otro método que podrías agregar
  async obtenerUsuarioPorId(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, usuario, email, nombre_completo, telefono, fecha_creacion FROM usuarios WHERE id = ?',
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      console.error('Error en usuarioService.obtenerUsuarioPorId:', error);
      throw error;
    }
  }
}

module.exports = new UsuarioService();