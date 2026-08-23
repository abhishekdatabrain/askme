const { Sequelize } = require('sequelize');
const pg = require('pg');

let sequelize;

const getLocalTimezoneOffset = () => {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  return `${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
};

const dbTimezone = process.env.DB_TIMEZONE || getLocalTimezoneOffset();

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    timezone: dbTimezone,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
      useUTC: false,
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
      dialectModule: pg,
      timezone: dbTimezone,
      schema: process.env.SCHEMA || 'Abhishek',
      searchPath: process.env.SCHEMA || 'Abhishek',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        useUTC: false,
      },
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

    // Ensure configured schema exists in PostgreSQL database before sync
    const targetSchema = process.env.SCHEMA || 'Abhishek';
    if (targetSchema && targetSchema !== 'public') {
      try {
        await sequelize.createSchema(targetSchema, { logging: false });
        console.log(`Schema "${targetSchema}" verified/created successfully.`);
      } catch (schemaErr) {
        // Ignore if schema already exists or permission restricted
      }
    }

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
