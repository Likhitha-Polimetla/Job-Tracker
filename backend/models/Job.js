const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'], 
    default: 'Applied' 
  },
  techStack: [{ type: String }],
  location: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);