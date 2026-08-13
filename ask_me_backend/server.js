const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");

// Load environment variables before importing app
dotenv.config();

const app = require('./src/app');
app.use(cookieParser());
const { connectDB } = require('./src/config/db.js');

const PORT = process.env.PORT || 5000;

// Initialize Sequelize Connection & Model Sync
connectDB();

// Start Server
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = server;
