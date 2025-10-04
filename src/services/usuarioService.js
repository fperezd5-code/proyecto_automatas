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

  async loginConCorreo(email, password) {
    const connection = await pool.getConnection();
    
    try {
      // Llamar al stored procedure de login
      await connection.query(
        'CALL sp_login_correo(?, ?, @p_resultado, @p_mensaje, @p_session_token)',
        [email, password]
      );

      // Obtener los valores de salida
      const [outputParams] = await connection.query(
        'SELECT @p_resultado AS resultado, @p_mensaje AS mensaje, @p_session_token AS session_token'
      );

      const { resultado, mensaje, session_token } = outputParams[0];

      // Si el login fue exitoso, obtener datos adicionales del usuario
      let datosUsuario = null;
      if (resultado > 0 && session_token) {
        const [rows] = await connection.query(
          `SELECT 
            id, 
            usuario, 
            email, 
            nombre_completo, 
            telefono,
            fecha_creacion
          FROM usuarios 
          WHERE id = ?`,
          [resultado]
        );
        
        datosUsuario = rows[0];
      }

      return {
        success: resultado > 0,
        resultado: resultado,
        mensaje: mensaje,
        session_token: session_token,
        datosUsuario: datosUsuario
      };

    } catch (error) {
      console.error('Error en usuarioService.loginConCorreo:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

}

module.exports = new UsuarioService();