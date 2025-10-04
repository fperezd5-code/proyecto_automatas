const { pool } = require('../config/database');

class UsuarioService {
  async registrarUsuario(datosUsuario) {
    const connection = await pool.getConnection();
    
    try {
      const { 
        usuario, 
        email, 
        nombre_completo, 
        password, 
        telefono,
        imagen_referencia,
        notif_email,
        notif_whatsapp
      } = datosUsuario;

      // Convertir valores booleanos a TINYINT (0 o 1)
      const emailNotif = notif_email === true || notif_email === 1 ? 1 : 0;
      const whatsappNotif = notif_whatsapp === true || notif_whatsapp === 1 ? 1 : 0;

      // Llamar al stored procedure con los nuevos parámetros
      await connection.query(
        `CALL sp_registrar_usuario(?, ?, ?, ?, ?, ?, ?, ?, @p_resultado, @p_mensaje)`,
        [
          usuario, 
          email, 
          nombre_completo, 
          password, 
          telefono || null,
          imagen_referencia,
          emailNotif,
          whatsappNotif
        ]
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
      await connection.query(
        'CALL sp_login_correo(?, ?, @p_resultado, @p_mensaje, @p_session_token)',
        [email, password]
      );

      const [outputParams] = await connection.query(
        'SELECT @p_resultado AS resultado, @p_mensaje AS mensaje, @p_session_token AS session_token'
      );

      const { resultado, mensaje, session_token } = outputParams[0];

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