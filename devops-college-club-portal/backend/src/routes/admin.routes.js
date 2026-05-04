const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const {
  getDashboard, createClub, assignLeader, deleteUser,
  getAllUsers, getAllClubs, updateClub, getReports
} = require('../controllers/admin.controller');

const adminOnly = roleMiddleware('admin');

router.use(authMiddleware, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.get('/clubs', getAllClubs);
router.post('/create-club', createClub);
router.put('/assign-leader', assignLeader);
router.delete('/user/:id', deleteUser);
router.put('/club/:id', updateClub);
router.get('/reports', getReports);

module.exports = router;
