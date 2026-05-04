const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  getClubs, joinClub, getEvents, registerForEvent,
  getHistory, getNotifications, markNotifRead
} = require('../controllers/student.controller');

router.get('/clubs', authMiddleware, getClubs);
router.post('/clubs/join', authMiddleware, joinClub);
router.get('/events', authMiddleware, getEvents);
router.post('/events/register', authMiddleware, registerForEvent);
router.get('/history', authMiddleware, getHistory);
router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications/:id/read', authMiddleware, markNotifRead);

module.exports = router;
