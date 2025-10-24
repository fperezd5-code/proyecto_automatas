/* Archivo: src/services/qrUsuarioService.js */

// Asegúrate de que la ruta a 'database' sea correcta
const { pool } = require('../config/database'); 
const crypto = require('crypto');
const QRCode = require('qrcode');

class QrUsuarioService {
  /**
   * Genera un QR para el login.
   * MODIFICADO: Primero busca si ya existe un QR activo para el usuario.
   * Si existe, devuelve ese. Si no, crea uno nuevo.
   */
  async generarQrPorDatos(datosUsuario) {
    const { usuario, nombre_completo, email, telefono } = datosUsuario;
    const connection = await pool.getConnection();
    try {
      console.log('========================================');
      console.log('🔍 DEBUG - Inicia generarQrPorDatos (Lógica de QR Permanente)');
      console.log('========================================');

      // 1. Validar al usuario
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

      // 2. Buscar si ya existe un QR activo para este usuario
      const [qrExistente] = await connection.query(
        `SELECT codigo_qr FROM codigos_qr 
         WHERE usuario_id = ? AND activo = 1 
         LIMIT 1`,
        [usuarioEncontrado.id]
      );

      let loginToken;
      let mensaje;

      if (qrExistente.length > 0) {
        // 3a. Si ya existe, usamos el token encontrado
        loginToken = qrExistente[0].codigo_qr;
        mensaje = 'QR recuperado exitosamente.';
        console.log(`🔑 QR existente recuperado para usuario ${usuarioEncontrado.id}.`);
      } else {
        // 3b. Si no existe, generamos uno nuevo y lo guardamos
        loginToken = crypto.randomBytes(24).toString('hex'); // Token de 48 caracteres.
        const token_hash = crypto.createHash('sha256').update(loginToken).digest('hex');

        await connection.query(
          `INSERT INTO codigos_qr (usuario_id, codigo_qr, qr_hash, activo)
           VALUES (?, ?, ?, 1)`,
          [usuarioEncontrado.id, loginToken, token_hash]
        );
        
        mensaje = 'QR generado exitosamente por primera vez.';
        console.log(`✅ Nuevo token de QR generado (${loginToken}) y guardado.`);
      }

      // 4. Generar la imagen del QR a partir del token (sea nuevo o existente)
      const codigo_qr_base64 = await QRCode.toDataURL(loginToken);
      
      console.log('========================================');

      return { success: true, codigo_qr: codigo_qr_base64, mensaje: mensaje };

    } catch (error) {
      console.error('❌ Error fatal en generarQrPorDatos:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Valida el token escaneado del QR, crea una sesión y devuelve los datos del usuario.
   * (MODIFICADO: El QR ya no expira y es de uso múltiple)
   */
  async validarQrLogin(qrData) { // Recibe el token del QR
    const connection = await pool.getConnection();
    try {
      // Busca el token en la columna 'codigo_qr'
      const [qrRows] = await connection.query(
        'SELECT id, usuario_id FROM codigos_qr WHERE codigo_qr = ? AND activo = 1',
        [qrData]
      );

      if (qrRows.length === 0) {
        // Si no se encuentra, es inválido
        return { success: false, mensaje: 'QR inválido o no encontrado.' };
      }

      const qrRecord = qrRows[0];
      
      // --- MODIFICACIÓN (Uso Múltiple) ---
      // La siguiente línea está comentada para evitar que el QR se desactive (expire)
      // await connection.query('UPDATE codigos_qr SET activo = 0 WHERE id = ?', [qrRecord.id]);
      // --- FIN DE MODIFICACIÓN ---
      
      const usuarioId = qrRecord.usuario_id;
      const sessionToken = crypto.randomBytes(32).toString('hex');

      // Se crea una NUEVA sesión cada vez que se escanea el QR
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