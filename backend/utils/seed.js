const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'admin',
        phone: '0300-0000000'
      });
      console.log('✅ Default admin created: admin@hospital.com / admin123');
    }

    // Seed sample doctors
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      const sampleDoctors = [
        { name: 'Dr. Sarah Khan', email: 'sarah@hospital.com', specialization: 'Cardiologist', qualification: 'MBBS, MD (Cardiology)', experience: 12, fees: 2000, about: 'Expert cardiologist with 12 years of experience in treating heart conditions.' },
        { name: 'Dr. Ahmed Raza', email: 'ahmed@hospital.com', specialization: 'Neurologist', qualification: 'MBBS, FCPS (Neurology)', experience: 8, fees: 2500, about: 'Specialist in neurological disorders and brain health.' },
        { name: 'Dr. Fatima Ali', email: 'fatima@hospital.com', specialization: 'Pediatrician', qualification: 'MBBS, DCH', experience: 6, fees: 1500, about: 'Compassionate pediatrician dedicated to children\'s health and wellness.' },
        { name: 'Dr. Omar Sheikh', email: 'omar@hospital.com', specialization: 'Orthopedic', qualification: 'MBBS, FCPS (Orthopedics)', experience: 10, fees: 2200, about: 'Specialist in bone, joint and muscle conditions.' },
        { name: 'Dr. Ayesha Malik', email: 'ayesha@hospital.com', specialization: 'Dermatologist', qualification: 'MBBS, DDV', experience: 7, fees: 1800, about: 'Expert in skin care, hair and nail conditions.' },
        { name: 'Dr. Bilal Hassan', email: 'bilal@hospital.com', specialization: 'General Physician', qualification: 'MBBS, MRCP', experience: 15, fees: 1200, about: 'Experienced general physician providing comprehensive primary care.' },
      ];

      const defaultSlots = [
        { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM'] },
        { day: 'Saturday', slots: ['10:00 AM', '11:00 AM', '12:00 PM'] },
      ];

      for (const d of sampleDoctors) {
        const userExists = await User.findOne({ email: d.email });
        if (!userExists) {
          const user = await User.create({ name: d.name, email: d.email, password: 'doctor123', role: 'doctor', phone: '0300-1234567' });
          await Doctor.create({ userId: user._id, specialization: d.specialization, qualification: d.qualification, experience: d.experience, fees: d.fees, about: d.about, availableSlots: defaultSlots, rating: (4 + Math.random()).toFixed(1), totalReviews: Math.floor(Math.random() * 200) + 50 });
        }
      }
      console.log('✅ Sample doctors seeded');
    }

    const demoPatient = await User.findOne({ email: 'patient@demo.com' });
    if (!demoPatient) {
      await User.create({
        name: 'Demo Patient',
        email: 'patient@demo.com',
        password: 'patient123',
        role: 'patient',
        phone: '0300-1111111',
        gender: 'male',
        address: '123 Health Street, City'
      });
      console.log('✅ Demo patient created: patient@demo.com / patient123');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = { seedAdmin };
