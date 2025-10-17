const { pool } = require('../config/database');
const crypto = require('crypto');
const QRCode = require('qrcode');

class QrUsuarioService {
  /**
   * Genera un QR para el login validando los datos personales y usando un token.
   */
  async generarQrPorDatos(datosUsuario) {
    const { usuario, nombre_completo, email, telefono } = datosUsuario;
    const connection = await pool.getConnection();
    try {
      console.log('========================================');
      console.log('🔍 DEBUG - Inicia generarQrPorDatos con Lógica de Token');
      console.log('========================================');

      const [rows] = await connection.query(
        `SELECT id, activo FROM usuarios
         WHERE usuario = ? AND nombre_completo = ? AND email = ? AND telefono = ?`,
        [usuario, nombre_completo, email, telefono]
      );

      if (rows.length === 0) {
        return { success: false, mensaje: 'Los datos no coinciden con ningún usuario registrado.' };
      }

      const usuarioEncontrado = rows[0];

      if (usuarioEncontrado.activo !== 1) {
        return { success: false, mensaje: 'La cuenta de usuario está inactiva.' };
      }

      console.log('Resultado: Usuario encontrado y activo.');

      // 1. Generar un token único y corto en lugar de un payload JSON.
      const loginToken = crypto.randomBytes(24).toString('hex'); // Token de 48 caracteres.

      // 2. Generar la imagen del QR a partir del token.
      const codigo_qr_base64 = await QRCode.toDataURL(loginToken);
      const token_hash = crypto.createHash('sha256').update(loginToken).digest('hex');

      // 3. Guardar el TOKEN (no la imagen) en la columna 'codigo_qr'.
      await connection.query(
        `INSERT INTO codigos_qr (usuario_id, codigo_qr, qr_hash, activo)
         VALUES (?, ?, ?, 1)`,
        [usuarioEncontrado.id, loginToken, token_hash]
      );

      console.log(`✅ Token de QR generado (${loginToken}) y guardado exitosamente.`);
      console.log('========================================');

      return { success: true, codigo_qr: codigo_qr_base64, mensaje: 'QR generado exitosamente.' };

    } catch (error) {
      console.error('❌ Error fatal en generarQrPorDatos:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Valida el token escaneado del QR, crea una sesión y devuelve los datos del usuario.
   */
  async validarQrLogin(qrData) { // Ahora recibe el token del QR
    const connection = await pool.getConnection();
    try {
      // Busca el token en la columna 'codigo_qr'
      const [qrRows] = await connection.query(
        'SELECT id, usuario_id FROM codigos_qr WHERE codigo_qr = ? AND activo = 1',
        [qrData]
      );

      if (qrRows.length === 0) {
        return { success: false, mensaje: 'QR inválido, expirado o ya fue utilizado.' };
      }

      const qrRecord = qrRows[0];
      // Desactiva el token para que no se pueda reusar.
      await connection.query('UPDATE codigos_qr SET activo = 0 WHERE id = ?', [qrRecord.id]);
      
      const usuarioId = qrRecord.usuario_id;
      const sessionToken = crypto.randomBytes(32).toString('hex');

      await connection.query(
        `INSERT INTO sesiones (usuario_id, session_token, metodo_login, activa, fecha_login) 
         VALUES (?, ?, 'qr', 1, NOW())`,
        [usuarioId, sessionToken]
      );

      const [userRows] = await connection.query(
        'SELECT id, usuario, email, nombre_completo, telefono, activo FROM usuarios WHERE id = ?',
        [usuarioId]
      );

      return {
        success: true,
        mensaje: 'Login por QR exitoso',
        session_token: sessionToken,
        usuario: userRows[0]
      };
    } catch (error) {
      console.error('❌ Error fatal en validarQrLogin:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = new QrUsuarioService();

