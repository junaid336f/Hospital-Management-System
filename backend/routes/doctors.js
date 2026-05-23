const express = require('express');
const router = express.Router();
const { getAllDoctors, getAllDoctorsAdmin, getDoctorById, getMyProfile, updateMyProfile } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllDoctors);
router.get('/admin-all', protect, authorize('admin'), getAllDoctorsAdmin);
router.get('/my-profile', protect, authorize('doctor'), getMyProfile);
router.put('/my-profile', protect, authorize('doctor'), updateMyProfile);
router.get('/:id', getDoctorById);

module.exports = router;
