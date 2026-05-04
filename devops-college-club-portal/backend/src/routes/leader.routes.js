const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const {
  createEvent, getMembers, approveMember,
  markAttendance, postNotice, getLeaderEvents, getEventAttendance
} = require('../controllers/leader.controller');

const leaderOrAdmin = roleMiddleware('leader', 'admin');

router.post('/events/create', authMiddleware, leaderOrAdmin, createEvent);
router.get('/members', authMiddleware, leaderOrAdmin, getMembers);
router.post('/members/approve', authMiddleware, leaderOrAdmin, approveMember);
router.post('/attendance/mark', authMiddleware, leaderOrAdmin, markAttendance);
router.post('/notices', authMiddleware, leaderOrAdmin, postNotice);
router.get('/club/events', authMiddleware, leaderOrAdmin, getLeaderEvents);
router.get('/attendance/:event_id', authMiddleware, leaderOrAdmin, getEventAttendance);

module.exports = router;
