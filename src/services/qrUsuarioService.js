const { pool } = require('../config/database');
const crypto = require('crypto');
const QRCode = require('qrcode');

class QrUsuarioService {
  async generarQrLogin(email, password) {
    const connection = await pool.getConnection();
    try {
      console.log('========================================');
      console.log('🔍 DEBUG - generarQrLogin');
      console.log('========================================');
      console.log('Email recibido:', email);
      console.log('Tipo de email:', typeof email);
      console.log('Length email:', email ? email.length : 'null');
      console.log('Password recibido:', password);
      console.log('Tipo de password:', typeof password);
      console.log('Length password:', password ? password.length : 'null');
      console.log('');

      // Hashear el password con SHA256
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      console.log('🔐 Password hasheado:', passwordHash);
      console.log('');

      // Query con logs
      console.log('🔍 Ejecutando query...');
      const [rows] = await connection.query(
        'SELECT id, email, password_hash, activo FROM usuarios WHERE email = ? AND password_hash = ? AND activo = 1',
        [email, passwordHash]
      );

      console.log('📊 Resultados de la query:', rows.length);
      if (rows.length > 0) {
        console.log('✅ Usuario encontrado:', rows[0]);
      } else {
        console.log('❌ No se encontró usuario');
        
        // Debug adicional
        const [testEmail] = await connection.query(
          'SELECT id, email, password_hash, activo FROM usuarios WHERE email = ?',
          [email]
        );
        console.log('🔍 Usuario con ese email existe?', testEmail.length > 0);
        if (testEmail.length > 0) {
          console.log('  Datos del usuario:', testEmail[0]);
          console.log('  Password en BD:', testEmail[0].password_hash);
          console.log('  Password recibido:', password);
          console.log('  Son iguales?', testEmail[0].password_hash === password);
          console.log('  Activo?', testEmail[0].activo);
        }
      }
      console.log('========================================\n');

      if (rows.length === 0) {
        return { success: false, mensaje: 'Credenciales inválidas o usuario inactivo' };
      }

      const usuarioId = rows[0].id;
      const qrPayload = JSON.stringify({
        usuario_id: usuarioId,
        email,
        timestamp: Date.now()
      });

      const codigo_qr = await QRCode.toDataURL(qrPayload);
      const qr_hash = crypto.createHash('sha256').update(codigo_qr).digest('hex');

      await connection.query(
        `INSERT INTO codigos_qr (usuario_id, codigo_qr, qr_hash) VALUES (?, ?, ?)`,
        [usuarioId, codigo_qr, qr_hash]
      );

      return { success: true, codigo_qr, mensaje: 'QR generado exitosamente' };
    } catch (error) {
      console.error('❌ Error generando QR:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async validarQrLogin(qrBase64) {
    const connection = await pool.getConnection();
    try {
      // Buscar QR en la BD
      const [qrRows] = await connection.query(
        'SELECT usuario_id, activo FROM codigos_qr WHERE codigo_qr = ?',
        [qrBase64]
      );

      if (qrRows.length === 0 || !qrRows[0].activo) {
        return { success: false, mensaje: 'QR inválido o inactivo' };
      }

      const usuarioId = qrRows[0].usuario_id;

      // Generar token de sesión
      const sessionToken = crypto.randomBytes(32).toString('hex');

      // Insertar sesión con método login 'qr'
      await connection.query(
        `INSERT INTO sesiones (usuario_id, session_token, metodo_login, activa) VALUES (?, ?, 'qr', 1)`,
        [usuarioId, sessionToken]
      );

      // Datos de usuario
      const [userRows] = await connection.query(
        `SELECT id, usuario, email, nombre_completo, telefono, activo FROM usuarios WHERE id = ?`,
        [usuarioId]
      );

      return {
        success: true,
        mensaje: 'Login por QR exitoso',
        session_token: sessionToken,
        usuario: userRows[0]
      };
    } catch (error) {
      console.error('Error validando QR:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new QrUsuarioService();