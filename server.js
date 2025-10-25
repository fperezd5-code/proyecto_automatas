// server.js - Punto de entrada del servidor

require('dotenv').config();
const app = require('./src/app');
const { checkConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// ========================================
// INICIAR SERVIDOR
// ========================================
const startServer = async () => {
  try {
    console.log('');
    console.log('========================================');
    console.log('🔄 INICIANDO SERVIDOR...');
    console.log('========================================');
    
    // Verificar conexión a la base de datos
    console.log('📊 Verificando conexión a la base de datos...');
    await checkConnection();
    console.log('✅ Conexión a la base de datos exitosa');
    
    console.log('');
    console.log('🚀 Iniciando servidor Express...');
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
      console.log('========================================');
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🕐 Hora: ${new Date().toLocaleString()}`);
      console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('========================================');
      console.log('📋 ENDPOINTS DISPONIBLES:');
      console.log('');
      console.log('   🏥 Health Check:');
      console.log(`      GET  http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('   👤 Usuarios:');
      console.log(`      POST http://localhost:${PORT}/api/usuarios/registro`);
      console.log(`      POST http://localhost:${PORT}/api/usuarios/login`);
      console.log(`      POST http://localhost:${PORT}/api/usuarios/login-qr  🆕 NUEVO`);
      console.log('');
      console.log('   🔐 QR:');
      console.log(`      POST http://localhost:${PORT}/api/qrusuario`);
      console.log(`      POST http://localhost:${PORT}/api/qrusuario/validar`);
      console.log('');
      console.log('   👁️ Reconocimiento Facial:');
      console.log(`      POST http://localhost:${PORT}/api/facial/verificar`);
      console.log('');
      console.log('========================================');
      console.log('✅ Servidor listo para recibir peticiones');
      console.log('========================================');
      console.log('');
    });

    // ========================================
    // MANEJO DE ERRORES DEL SERVIDOR
    // ========================================
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error('');
        console.error('❌ ERROR: El puerto ' + PORT + ' ya está en uso');
        console.error('💡 Soluciones:');
        console.error('   1. Cambia el puerto en el archivo .env');
        console.error('   2. Detén el proceso que está usando el puerto');
        console.error('   3. En Linux/Mac: lsof -ti:' + PORT + ' | xargs kill -9');
        console.error('   4. En Windows: netstat -ano | findstr :' + PORT);
        console.error('');
      } else {
        console.error('❌ ERROR al iniciar el servidor:', error);
      }
      process.exit(1);
    });

    // ========================================
    // GRACEFUL SHUTDOWN
    // ========================================
    process.on('SIGTERM', () => {
      console.log('');
      console.log('⚠️ SIGTERM recibido. Cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('');
      console.log('⚠️ SIGINT recibido (Ctrl+C). Cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('');
    console.error('========================================');
    console.error('❌ ERROR AL INICIAR SERVIDOR');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Problema de conexión a la base de datos:');
      console.error('   1. Verifica que MySQL/MariaDB esté corriendo');
      console.error('   2. Verifica las credenciales en el archivo .env');
      console.error('   3. Verifica que la base de datos exista');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Error de autenticación:');
      console.error('   1. Verifica el usuario y contraseña en .env');
      console.error('   2. Verifica los permisos del usuario en la BD');
    } else {
      console.error('Stack trace:', error.stack);
    }
    
    console.error('');
    console.error('========================================');
    process.exit(1);
  }
};

// ========================================
// MANEJO DE ERRORES NO CAPTURADOS
// ========================================
process.on('uncaughtException', (error) => {
  console.error('');
  console.error('❌ UNCAUGHT EXCEPTION:');
  console.error(error);
  console.error('');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('');
  console.error('❌ UNHANDLED REJECTION:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('');
});

// ========================================
// INICIAR
// ========================================
startServer();