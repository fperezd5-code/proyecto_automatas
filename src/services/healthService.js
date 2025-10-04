const { pool } = require('../config/database');

class HealthService {
  async checkDatabaseHealth() {
    try {
      const [rows] = await pool.query('SELECT 1 as health');
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getServerHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new HealthService();