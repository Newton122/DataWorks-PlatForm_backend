const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes (specific, before parameterized)
router.get('/user/saved', authMiddleware, jobController.getSavedJobs);

// Public specific routes (must be before /:id)
router.get('/stats', jobController.getJobStats);
router.get('/category/:category', jobController.getJobsByCategory);
router.get('/type/:type', jobController.getJobsByType);
router.get('/internships', jobController.getInternshipJobs);

// Public routes
router.get('/', jobController.getJobs);
router.post('/', authMiddleware, jobController.createJob);

// Parameterized routes (MUST be last)
router.get('/:id', jobController.getJob);
router.put('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);
router.post('/:id/save', authMiddleware, jobController.toggleSaveJob);

module.exports = router;
