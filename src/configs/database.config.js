const mongoose = require('mongoose');
const { PinoLogger } = require('@papdaew/shared');

const Config = require('#vendors/configs/config.js');

class Database {
  #logger;
  #config;
  static #instance;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    this.#config = new Config();
    this.#logger = new PinoLogger().child({ service: 'Database' });
    Database.#instance = this;
  }

  connect = async () => {
    try {
      const connectionOptions = {
        serverSelectionTimeoutMS:
          this.#config.NODE_ENV === 'development' ? 2000 : 30000,
        connectTimeoutMS:
          this.#config.NODE_ENV === 'development' ? 2000 : 10000,
        socketTimeoutMS: this.#config.NODE_ENV === 'development' ? 3000 : 45000,
      };

      await mongoose.connect(this.#config.MONGODB_URI, connectionOptions);
      this.#logger.info('Successfully connected to MongoDB');
    } catch (error) {
      this.#logger.error(error, 'Failed to connect to MongoDB');
      throw error;
    }
  };

  disconnect = async () => {
    await mongoose.disconnect();
  };
}

module.exports = Database;
