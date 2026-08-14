require('pg');
require('pg-hstore');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Vercel serverless database connection error:', err);
    }
  }
  return app(req, res);
};
