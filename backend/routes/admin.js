const express = require('express');
const router = express.Router();
const { getStats, getAllPatients, addDoctor, updateDoctor, deleteDoctor } = require('../controllers/adminController');
const { getAllAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/patients', getAllPatients);
router.post('/doctors', addDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

module.exports = router;
