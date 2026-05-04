const { User, Club, Event, Membership, Attendance, Notification } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalClubs, totalEvents, totalMemberships, pendingApprovals] = await Promise.all([
      User.count(),
      Club.count(),
      Event.count(),
      Membership.count({ where: { status: 'approved' } }),
      Membership.count({ where: { status: 'pending' } }),
    ]);

    const recentUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    const clubStats = await Club.findAll({
      include: [
        { model: Membership, as: 'memberships', attributes: [] },
      ],
    });

    res.json({
      stats: { totalUsers, totalClubs, totalEvents, totalMemberships, pendingApprovals },
      recentUsers,
      clubs: clubStats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/create-club
const createClub = async (req, res) => {
  try {
    const { club_name, category, description, leader_id } = req.body;
    if (!club_name || !category) return res.status(400).json({ error: 'club_name and category required' });

    const club = await Club.create({ club_name, category, description, leader_id: leader_id || null });
    res.status(201).json({ message: 'Club created', club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/assign-leader
const assignLeader = async (req, res) => {
  try {
    const { club_id, user_id } = req.body;
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await Club.update({ leader_id: user_id }, { where: { club_id } });
    await User.update({ role: 'leader' }, { where: { id: user_id } });

    await Notification.create({ user_id, message: `You have been assigned as leader of club ID ${club_id}` });

    res.json({ message: 'Leader assigned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/user/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'created_at'] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/clubs
const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.findAll({
      include: [{ model: User, as: 'leader', attributes: ['id', 'name', 'email'] }],
    });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/club/:id
const updateClub = async (req, res) => {
  try {
    const { club_name, category, description, status } = req.body;
    await Club.update({ club_name, category, description, status }, { where: { club_id: req.params.id } });
    res.json({ message: 'Club updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const [membersByClub, eventsByClub, attendanceRate] = await Promise.all([
      Membership.findAll({
        where: { status: 'approved' },
        include: [{ model: Club, as: 'club', attributes: ['club_name'] }],
      }),
      Event.findAll({
        include: [{ model: Club, as: 'club', attributes: ['club_name'] }],
      }),
      Attendance.count({ where: { status: 'present' } }),
    ]);
    res.json({ membersByClub, eventsByClub, presentCount: attendanceRate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDashboard, createClub, assignLeader, deleteUser, getAllUsers, getAllClubs, updateClub, getReports };
