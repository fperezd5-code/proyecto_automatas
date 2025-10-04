require('dotenv').config();
const app = require('./src/app');
const { checkConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await checkConnection();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();