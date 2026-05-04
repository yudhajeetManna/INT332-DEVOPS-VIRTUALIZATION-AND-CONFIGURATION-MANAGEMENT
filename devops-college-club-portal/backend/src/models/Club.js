const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Club = sequelize.define('Club', {
  club_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  club_name: { type: DataTypes.STRING(100), allowNull: false },
  category: { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.TEXT },
  leader_id: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { timestamps: false, tableName: 'clubs' });

module.exports = Club;
