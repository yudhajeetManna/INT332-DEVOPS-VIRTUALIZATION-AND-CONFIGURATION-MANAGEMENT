const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  event_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(150), allowNull: false },
  venue: { type: DataTypes.STRING(200) },
  event_date: { type: DataTypes.DATE, allowNull: false },
  club_id: { type: DataTypes.INTEGER, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT },
}, { timestamps: false, tableName: 'events' });

module.exports = Event;
