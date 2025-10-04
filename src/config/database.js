const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
});

// Función para verificar la conexión
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a MySQL RDS');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error conectando a MySQL RDS:', error.message);
    return false;
  }
};

module.exports = { pool, checkConnection };