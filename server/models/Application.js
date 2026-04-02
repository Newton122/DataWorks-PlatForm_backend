const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: [true, 'Job is required']
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Freelancer is required']
  },
  proposal: {
    type: String,
    required: [true, 'Proposal is required'],
    trim: true,
    maxlength: 5000
  },
  proposedBudget: {
    type: Number,
    min: 0
  },
  applicantDetails: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    yearsExperience: {
      type: String,
      trim: true
    },
    desiredSalary: {
      type: Number,
      min: 0
    },
    workAuthorization: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    visaSponsorship: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    remoteOk: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
applicationSchema.index({ job: 1, freelancer: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ freelancer: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
