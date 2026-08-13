const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.PGDATABASE || 'ask_me',
    process.env.PGUSER || 'postgres',
    process.env.PGPASSWORD || 'admin123',
    {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      dialect: 'postgres',
      schema: process.env.SCHEMA || 'Abhishek',
      searchPath: process.env.SCHEMA || 'Abhishek',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

/**
 * Connect to PostgreSQL via Sequelize ORM and synchronize models
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize ORM connected to PostgreSQL successfully.');
    // Synchronize models with PostgreSQL database
    await sequelize.sync({ alter: false });
    console.log('Sequelize database models synchronized successfully.');
  } catch (error) {
    console.error(`Sequelize Connection Error: ${error.message}`);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
