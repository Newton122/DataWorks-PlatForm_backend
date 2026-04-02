const express = require('express');
const router = express.Router();
const {
  createApplication,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const protect = require('../middleware/authMiddleware');

// @desc  Apply to job (freelancer POST)
router.post('/apply', protect(['freelancer']), createApplication);

// @desc  Get applications for job (client GET)
router.get('/:jobId/applications', protect(['client', 'admin']), getJobApplications);

// @desc  Get my applications (freelancer GET)
router.get('/my', protect(['freelancer']), getMyApplications);

// @desc  Update application status (client PATCH)
router.patch('/:applicationId/status', protect(['client', 'admin']), updateApplicationStatus);

module.exports = router;
