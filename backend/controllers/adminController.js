const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    res.json({ totalPatients, totalDoctors, totalAppointments, pendingAppointments, completedAppointments, cancelledAppointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/admin/doctors - add doctor
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, gender, specialization, qualification, experience, fees, hospital, about, availableSlots } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, gender, role: 'doctor' });
    const doctor = await Doctor.create({
      userId: user._id, specialization, qualification, experience: Number(experience),
      fees: Number(fees), hospital, about,
      availableSlots: availableSlots || [
        { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      ]
    });
    const populated = await Doctor.findById(doctor._id).populate('userId', 'name email phone gender');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/doctors/:id
const updateDoctor = async (req, res) => {
  try {
    const { specialization, qualification, experience, fees, hospital, about, isAvailable, availableSlots } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { specialization, qualification, experience, fees, hospital, about, isAvailable, availableSlots },
      { new: true }
    ).populate('userId', 'name email phone gender');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/admin/doctors/:id
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await User.findByIdAndUpdate(doctor.userId, { isActive: false });
    res.json({ message: 'Doctor removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getAllPatients, addDoctor, updateDoctor, deleteDoctor };
