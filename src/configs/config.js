const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

class Config {
  constructor() {
    this.PORT = process.env.PORT || 3004;
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
    this.SERVICE_VERSION = process.env.SERVICE_VERSION || '1.0.0';
    this.MONGODB_URI = process.env.MONGODB_URI;
    this.RABBITMQ_URL = process.env.RABBITMQ_URL;
  }
}

module.exports = Config;
