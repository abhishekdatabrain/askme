const http = require('http');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");

// Load environment variables before importing app
dotenv.config();

const app = require('./src/app');
app.use(cookieParser());
const { connectDB } = require('./src/config/db.js');
const { initSocket } = require('./src/config/socket.js');
const { startSessionScheduler } = require('./src/utils/sessionScheduler.js');

const PORT = process.env.PORT || 5000;

// Initialize Sequelize Connection & Model Sync
connectDB();

// Initialize Live Session Auto-Expiry Cron/Scheduler Runner
startSessionScheduler(30000);

// Create HTTP Server & Attach Socket.IO
const server = http.createServer(app);
initSocket(server);

// Start Server
server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} with Socket.IO initialized`
  );
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = server;
