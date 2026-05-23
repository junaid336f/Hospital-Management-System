const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true },
  fees: { type: Number, required: true },
  hospital: { type: String, default: 'City General Hospital' },
  about: { type: String, default: '' },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  availableSlots: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    slots: [{ type: String }]
  }],
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
