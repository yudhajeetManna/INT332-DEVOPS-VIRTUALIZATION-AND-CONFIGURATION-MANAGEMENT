const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Membership = sequelize.define('Membership', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  club_id: { type: DataTypes.INTEGER, allowNull: false },
  join_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
}, { timestamps: false, tableName: 'memberships' });

module.exports = Membership;
