const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @GET /api/doctors - get all doctors (public)
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let filter = { isAvailable: true };
    const doctors = await Doctor.find(filter).populate('userId', 'name email phone gender profileImage');
    
    let result = doctors;
    if (specialization) result = result.filter(d => d.specialization === specialization);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(d =>
        d.userId?.name?.toLowerCase().includes(s) ||
        d.specialization?.toLowerCase().includes(s)
      );
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/doctors/all - admin gets all (incl inactive)
const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email phone gender profileImage isActive');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone gender profileImage');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/doctors/my-profile (doctor)
const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email phone gender');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/doctors/my-profile (doctor)
const updateMyProfile = async (req, res) => {
  try {
    const { availableSlots, isAvailable, about, fees } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { availableSlots, isAvailable, about, fees },
      { new: true }
    ).populate('userId', 'name email phone gender');
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllDoctors, getAllDoctorsAdmin, getDoctorById, getMyProfile, updateMyProfile };
