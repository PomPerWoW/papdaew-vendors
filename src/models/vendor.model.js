const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: true,
    },
    branchCode: {
      type: String,
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Location',
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: String,
    branchManager: String,
    businessHours: [
      {
        _id: false,
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
    // New fields for branch statistics
    metrics: {
      totalCustomers: {
        type: Number,
        default: 0,
      },
      totalQueues: {
        type: Number,
        default: 0,
      },
      avgWaitTime: {
        type: Number,
        default: 0,
      },
      avgServeTime: {
        type: Number,
        default: 0,
      },
      weeklyCustomers: {
        type: Number,
        default: 0,
      },
      monthlyCustomers: {
        type: Number,
        default: 0,
      },
      peakHours: [Number],
      peakDays: [Number],
    },
    // New fields for ratings
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
      distribution: {
        five: { type: Number, default: 0 },
        four: { type: Number, default: 0 },
        three: { type: Number, default: 0 },
        two: { type: Number, default: 0 },
        one: { type: Number, default: 0 },
      },
      // Store recent reviews
      reviews: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          comment: String,
          date: {
            type: Date,
            default: Date.now,
          },
          staffResponse: {
            comment: String,
            date: Date,
          },
        },
      ],
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
        _id: false,
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
    // Vendor-level metrics
    metrics: {
      totalCustomers: {
        type: Number,
        default: 0,
      },
      totalQueues: {
        type: Number,
        default: 0,
      },
      avgRating: {
        type: Number,
        default: 0,
      },
      avgWaitTime: {
        type: Number,
        default: 0,
      },
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
