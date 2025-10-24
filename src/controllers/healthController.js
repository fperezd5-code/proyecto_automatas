const healthService = require('../services/healthService');

class HealthController {
  async healthCheck(req, res) {
    try {
      const dbHealth = await healthService.checkDatabaseHealth();
      const serverHealth = await healthService.getServerHealth();

      const isHealthy = dbHealth.status === 'healthy';
      const statusCode = isHealthy ? 200 : 503;

      res.status(statusCode).json({
        api: serverHealth,
        database: dbHealth
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error checking health',
        error: error.message
      });
    }
  }
}

module.exports = new HealthController();