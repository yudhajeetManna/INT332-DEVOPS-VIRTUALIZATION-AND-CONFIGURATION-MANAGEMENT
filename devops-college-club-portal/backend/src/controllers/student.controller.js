const { Club, Event, Membership, Notification, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/clubs
const getClubs = async (req, res) => {
  try {
    const clubs = await Club.findAll({
      where: { status: 'active' },
      include: [{ model: User, as: 'leader', attributes: ['id', 'name', 'email'] }],
    });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/clubs/join
const joinClub = async (req, res) => {
  try {
    const { club_id } = req.body;
    const student_id = req.user.id;

    const existing = await Membership.findOne({ where: { student_id, club_id } });
    if (existing) return res.status(409).json({ error: 'Already a member or request pending' });

    const membership = await Membership.create({ student_id, club_id });

    // Notify club leader
    const club = await Club.findByPk(club_id);
    if (club && club.leader_id) {
      await Notification.create({ user_id: club.leader_id, message: `New join request for ${club.club_name} from student ID ${student_id}` });
    }

    res.status(201).json({ message: 'Join request submitted', membership });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: Club, as: 'club', attributes: ['club_id', 'club_name'] }],
      order: [['event_date', 'ASC']],
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/events/register
const registerForEvent = async (req, res) => {
  try {
    const { event_id } = req.body;
    const student_id = req.user.id;
    const { Attendance } = require('../models');

    const existing = await Attendance.findOne({ where: { student_id, event_id } });
    if (existing) return res.status(409).json({ error: 'Already registered for this event' });

    const record = await Attendance.create({ student_id, event_id, status: 'absent' });
    res.status(201).json({ message: 'Registered for event', record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/history
const getHistory = async (req, res) => {
  try {
    const { Attendance } = require('../models');
    const student_id = req.user.id;

    const memberships = await Membership.findAll({
      where: { student_id },
      include: [{ model: Club, as: 'club' }],
    });

    const attendance = await Attendance.findAll({
      where: { student_id },
      include: [{ model: Event, as: 'event', include: [{ model: Club, as: 'club' }] }],
    });

    res.json({ memberships, attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/notifications/:id/read
const markNotifRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { notif_id: req.params.id, user_id: req.user.id } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getClubs, joinClub, getEvents, registerForEvent, getHistory, getNotifications, markNotifRead };
