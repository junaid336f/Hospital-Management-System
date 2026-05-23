const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @POST /api/appointments - patient books
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, symptoms } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!doctor.isAvailable) return res.status(400).json({ message: 'Doctor is not accepting appointments' });

    // Check for conflicting appointment
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['pending', 'approved'] }
    });
    if (conflict) return res.status(400).json({ message: 'This slot is already booked' });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      symptoms,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/appointments/my - patient sees their appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: 'doctor', populate: { path: 'userId', select: 'name email' } })
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/appointments/doctor - doctor sees their appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'name email phone gender dob address')
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/appointments/:id/status - doctor/admin updates status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, prescription, cancelReason } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, prescription, cancelReason },
      { new: true }
    ).populate('patient', 'name email phone')
     .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/appointments/:id - patient cancels
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/appointments/all - admin sees all
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { bookAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus, cancelAppointment, getAllAppointments };
