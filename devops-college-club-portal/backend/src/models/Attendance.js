const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('present', 'absent'), defaultValue: 'present' },
  marked_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: 'attendance' });

module.exports = Attendance;
