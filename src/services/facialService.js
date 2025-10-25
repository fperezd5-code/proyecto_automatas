const { pool } = require('../config/database');
const axios = require('axios');

class FacialService {

  constructor() {
    this.LOTE_SIZE = 10;
    this.MAX_PARALELO = 10;
    this.SCORE_MINIMO = 100;
    this.BIOMETRIC_API_URL = process.env.BIOMETRIC_API_URL;
    this.TIMEOUT_MS = 20000; // 5 segundos timeout por request
  }

  /**
   * Busca coincidencia facial en la base de datos
   */
  async buscarCoincidenciaFacial(rostroCapturado) {
    let offset = 0;
    let encontrado = false;
    let resultadoFinal = null;

    try {
      while (!encontrado) {
        const lote = await this.obtenerLoteRostros(offset, this.LOTE_SIZE);

        if (lote.length === 0) {
          break;
        }

        const resultado = await this.procesarLoteParalelo(rostroCapturado, lote);

        if (resultado.encontrado) {
          encontrado = true;
          resultadoFinal = resultado;
          break;
        }

        offset += this.LOTE_SIZE;
      }

      if (encontrado) {
        return {
          coincide: true,
          usuario_id: resultadoFinal.usuario_id,
          score: resultadoFinal.score
        };
      } else {
        return {
          coincide: false,
          mensaje: 'No se encontró coincidencia facial'
        };
      }

    } catch (error) {
      console.error('Error en búsqueda facial:', error);
      throw new Error('Error al procesar verificación facial');
    }
  }

  /**
   * Obtiene un lote de rostros de la base de datos
   */
  async obtenerLoteRostros(offset, limit) {
    const query = `
      SELECT 
        af.id,
        af.usuario_id,
        af.imagen_referencia
      FROM autenticacion_facial af
      WHERE af.activo = 1 
        AND af.imagen_referencia IS NOT NULL
        AND af.imagen_referencia != ''
      ORDER BY af.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [limit, offset]);
    return rows;
  }

  /**
   * Procesa un lote de rostros en paralelo
   */
  async procesarLoteParalelo(rostroA, lote) {
    const promesas = lote.map(rostro =>
      this.compararRostros(rostroA, rostro)
        .catch(error => {
          console.error(`Error comparando rostro ID ${rostro.id}:`, error.message);
          return { coincide: false, score: 0 };
        })
    );

    const resultados = await Promise.all(promesas);

    // Buscar el primer resultado que coincida
    const coincidencia = resultados.find(r => r.coincide && r.score >= this.SCORE_MINIMO);

    if (coincidencia) {
      return {
        encontrado: true,
        usuario_id: coincidencia.usuario_id,
        score: coincidencia.score
      };
    }

    return { encontrado: false };
  }

  /**
   * Compara dos rostros usando la API de biometría
   */
  async compararRostros(rostroA, registroRostro) {
    try {
      const response = await axios.post(
        this.BIOMETRIC_API_URL,
        {
          RostroA: rostroA,
          RostroB: registroRostro.imagen_referencia
        },
        {
          timeout: this.TIMEOUT_MS,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const { coincide, score, status } = response.data;

      // Solo retornar coincidencia si status es 'Ok' y coincide es true
      if (status === 'Ok' && coincide) {
        return {
          coincide: true,
          score: score ? parseInt(score) : 0,
          usuario_id: registroRostro.usuario_id
        };
      }

      // Cualquier otro caso: no coincide
      return {
        coincide: false,
        score: 0,
        usuario_id: registroRostro.usuario_id
      };

    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout en comparación facial');
      }
      throw error;
    }
  }

  async obtenerDatosLoginExitoso(usuarioId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Obtener datos del usuario
      const [usuario] = await connection.query(
        `SELECT id, usuario, nombre_completo, activo 
       FROM usuarios 
       WHERE id = ? AND activo = 1`,
        [usuarioId]
      );

      if (usuario.length === 0) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      const datosUsuario = usuario[0];

      // Desactivar sesiones anteriores
      await connection.query(
        `UPDATE sesiones 
       SET activa = 0 
       WHERE usuario_id = ? AND activa = 1`,
        [usuarioId]
      );

      // Generar token de sesión usando la función de la BD
      const [tokenResult] = await connection.query(
        'SELECT fn_generar_token_sesion(?) as token',
        [usuarioId]
      );
      const sessionToken = tokenResult[0].token;

      // Registrar nueva sesión
      await connection.query(
        `INSERT INTO sesiones (usuario_id, session_token, metodo_login, activa)
       VALUES (?, ?, 'facial', 1)`,
        [usuarioId, sessionToken]
      );

      // Obtener métodos de notificación activos
      const [metodosNotificacion] = await connection.query(
        `SELECT id, tipo_notificacion, destino, activo
       FROM metodos_notificacion
       WHERE usuario_id = ? AND activo = 1
       ORDER BY tipo_notificacion`,
        [usuarioId]
      );

      // Obtener autenticación facial
      const [autenticacionFacial] = await connection.query(
        `SELECT id, imagen_referencia, activo
       FROM autenticacion_facial
       WHERE usuario_id = ? AND activo = 1
       LIMIT 1`,
        [usuarioId]
      );

      await connection.commit();

      return {
        usuario_id: datosUsuario.id,
        mensaje: `Bienvenido ${datosUsuario.nombre_completo}`,
        session_token: sessionToken,
        metodos_notificacion: metodosNotificacion,
        autenticacion_facial: autenticacionFacial.length > 0 ? autenticacionFacial[0] : null
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

}

module.exports = new FacialService();