const mongoose = require('mongoose');

// Branch schema without embedded location
const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: true,
  },
  branchCode: {
    type: String,
    required: true,
  },
  // Reference to location in the location service
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Location', // This is just a reference name, not necessarily the actual model name in the location service
  },
  contactPhone: {
    type: String,
    required: true,
  },
  contactEmail: String,
  branchManager: String,
  businessHours: [
    {
      day: { type: Number, min: 0, max: 6 },
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false },
    },
  ],
  status: {
    type: String,
    enum: ['active', 'inactive', 'temporary-closed', 'coming-soon'],
    default: 'active',
  },
});

const vendorSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    businessDescription: String,
    businessType: {
      type: String,
      enum: [
        'RESTAURANT',
        'RETAIL',
        'HEALTHCARE',
        'GOVERNMENT',
        'FINANCIAL',
        'EDUCATION',
        'BEAUTY',
        'FITNESS',
        'ENTERTAINMENT',
        'OTHER',
      ],
      required: true,
    },
    contactEmail: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    // Reference to headquarters location
    headquartersLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
    website: String,
    logo: String,
    bannerImage: String,
    // Main headquarters business hours
    businessHours: [
      {
        day: { type: Number, min: 0, max: 6 },
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      line: String,
    },
    // Add branches array
    branches: [branchSchema],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

vendorSchema.virtual('branchCount').get(function () {
  return this.branches ? this.branches.length : 0;
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
