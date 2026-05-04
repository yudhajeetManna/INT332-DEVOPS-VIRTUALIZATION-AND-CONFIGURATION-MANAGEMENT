const { Event, Membership, Attendance, Notification, Club, User } = require('../models');

// POST /api/events/create
const createEvent = async (req, res) => {
  try {
    const { title, venue, event_date, club_id, description } = req.body;
    if (!title || !event_date || !club_id) return res.status(400).json({ error: 'title, event_date, club_id required' });

    // Verify leader owns this club
    const club = await Club.findOne({ where: { club_id, leader_id: req.user.id } });
    if (!club && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized for this club' });

    const event = await Event.create({ title, venue, event_date, club_id, created_by: req.user.id, description });

    // Notify all members
    const members = await Membership.findAll({ where: { club_id, status: 'approved' } });
    await Promise.all(members.map(m => Notification.create({
      user_id: m.student_id,
      message: `New event "${title}" in ${club.club_name} on ${new Date(event_date).toDateString()}`,
    })));

    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/members
const getMembers = async (req, res) => {
  try {
    const { club_id } = req.query;
    const where = { status: 'pending' };
    if (club_id) where.club_id = club_id;

    const members = await Membership.findAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Club, as: 'club', attributes: ['club_id', 'club_name'] },
      ],
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/members/approve
const approveMember = async (req, res) => {
  try {
    const { membership_id, action } = req.body; // action: 'approved' | 'rejected'
    const membership = await Membership.findByPk(membership_id);
    if (!membership) return res.status(404).json({ error: 'Membership not found' });

    membership.status = action === 'approved' ? 'approved' : 'rejected';
    await membership.save();

    await Notification.create({
      user_id: membership.student_id,
      message: `Your membership request has been ${membership.status}.`,
    });

    res.json({ message: `Member ${membership.status}`, membership });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/attendance/mark
const markAttendance = async (req, res) => {
  try {
    const { event_id, student_id, status } = req.body;
    const [record, created] = await Attendance.findOrCreate({
      where: { event_id, student_id },
      defaults: { status: status || 'present', marked_at: new Date() },
    });

    if (!created) {
      record.status = status || 'present';
      record.marked_at = new Date();
      await record.save();
    }

    res.json({ message: 'Attendance marked', record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notices
const postNotice = async (req, res) => {
  try {
    const { club_id, message } = req.body;
    const members = await Membership.findAll({ where: { club_id, status: 'approved' } });
    await Promise.all(members.map(m => Notification.create({ user_id: m.student_id, message })));
    res.json({ message: `Notice sent to ${members.length} members` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/club/events - leader's events
const getLeaderEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { created_by: req.user.id },
      include: [{ model: Club, as: 'club', attributes: ['club_id', 'club_name'] }],
      order: [['event_date', 'DESC']],
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/attendance/:event_id
const getEventAttendance = async (req, res) => {
  try {
    const event_id = req.params.event_id;

    // Get all students who registered for this event (have an attendance record)
    const attendance = await Attendance.findAll({
      where: { event_id },
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
    });

    // Also get approved members of the club this event belongs to,
    // and create absent records for those not yet in attendance
    const event = await Event.findByPk(event_id);
    if (event) {
      const members = await Membership.findAll({
        where: { club_id: event.club_id, status: 'approved' },
        include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
      });

      const existingIds = new Set(attendance.map(a => a.student_id));
      const missing = members.filter(m => !existingIds.has(m.student_id));

      // Create absent records for members not yet tracked
      const created = await Promise.all(
        missing.map(m => Attendance.create({ event_id, student_id: m.student_id, status: 'absent' }))
      );

      // Re-fetch with student info for newly created records
      const newRecords = await Attendance.findAll({
        where: { id: created.map(c => c.id) },
        include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
      });

      return res.json([...attendance, ...newRecords]);
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createEvent, getMembers, approveMember, markAttendance, postNotice, getLeaderEvents, getEventAttendance };
