const express = require('express');
const router = express.Router();
const {
  bookAppointment, getMyAppointments, getDoctorAppointments,
  updateAppointmentStatus, cancelAppointment, getAllAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/my', protect, authorize('patient'), getMyAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/all', protect, authorize('admin'), getAllAppointments);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
