require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const leaderRoutes = require('./routes/leader.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', leaderRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    setTimeout(startServer, 5000); // retry on failure
  }
};

startServer();

module.exports = app;
