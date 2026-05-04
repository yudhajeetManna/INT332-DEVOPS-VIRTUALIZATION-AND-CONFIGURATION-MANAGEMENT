const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('student', 'leader', 'admin'), defaultValue: 'student' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: 'users' });

module.exports = User;
