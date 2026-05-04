const sequelize = require('../config/database');
const User = require('./User');
const Club = require('./Club');
const Event = require('./Event');
const Membership = require('./Membership');
const Attendance = require('./Attendance');
const Notification = require('./Notification');

// Associations
Club.belongsTo(User, { foreignKey: 'leader_id', as: 'leader' });
User.hasMany(Club, { foreignKey: 'leader_id', as: 'ledClubs' });

Event.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Event.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Club.hasMany(Event, { foreignKey: 'club_id', as: 'events' });

Membership.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Membership.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
User.hasMany(Membership, { foreignKey: 'student_id', as: 'memberships' });
Club.hasMany(Membership, { foreignKey: 'club_id', as: 'memberships' });

Attendance.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Attendance.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, Club, Event, Membership, Attendance, Notification };
