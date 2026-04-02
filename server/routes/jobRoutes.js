const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', jobController.getJobs);
router.get('/stats', jobController.getJobStats);
router.get('/category/:category', jobController.getJobsByCategory);
router.get('/type/:type', jobController.getJobsByType);
router.get('/internships', jobController.getInternshipJobs);
router.get('/:id', jobController.getJob);

// Protected routes
router.post('/', authMiddleware, jobController.createJob);
router.put('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);
router.post('/:id/save', authMiddleware, jobController.toggleSaveJob);
router.get('/user/saved', authMiddleware, jobController.getSavedJobs);

module.exports = router;
