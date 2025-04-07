const axios = require('axios');
const { PinoLogger, NotFoundError } = require('@papdaew/shared');

const Vendor = require('#vendors/models/vendor.model.js');
const BranchEvents = require('#vendors/events/publishers/branch.publisher.js');

class VendorService {
  #logger;
  #usersServiceUrl;
  #branchEvents;

  constructor() {
    this.#logger = new PinoLogger({
      service: 'VendorService',
    });
    this.#usersServiceUrl =
      process.env.USERS_SERVICE_URL || 'http://papdaew-users:3001';
    this.#branchEvents = new BranchEvents();
  }

  async createVendor(vendorData) {
    try {
      const vendor = await Vendor.create(vendorData);

      this.#logger.info(
        { vendorId: vendor._id, businessName: vendor.businessName },
        'Vendor created'
      );

      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to create vendor');
      throw error;
    }
  }

  async getVendors(options = {}) {
    try {
      const { limit = 10, offset = 0, businessType, status } = options;

      const query = {};
      if (businessType) query.businessType = businessType;
      if (status) query.status = status;

      const vendors = await Vendor.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const total = await Vendor.countDocuments(query);

      this.#logger.info({ count: vendors.length, total }, 'Retrieved vendors');

      return { vendors, total };
    } catch (error) {
      this.#logger.error(error, 'Failed to get vendors');
      throw error;
    }
  }

  async getVendorById(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);

      if (!vendor) {
        this.#logger.info({ vendorId }, 'Vendor not found');
        return null;
      }

      this.#logger.info(
        { vendorId, businessName: vendor.businessName },
        'Retrieved vendor'
      );

      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to get vendor');
      throw error;
    }
  }

  async updateVendor(vendorId, updateData) {
    try {
      const vendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!vendor) {
        this.#logger.info({ vendorId }, 'Vendor not found for update');
        return null;
      }

      this.#logger.info(
        { vendorId, businessName: vendor.businessName },
        'Vendor updated'
      );

      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to update vendor');
      throw error;
    }
  }

  async deleteVendor(vendorId) {
    try {
      const vendor = await Vendor.findByIdAndDelete(vendorId);

      if (!vendor) {
        this.#logger.info({ vendorId }, 'Vendor not found for deletion');
        return false;
      }

      this.#logger.info(
        { vendorId, businessName: vendor.businessName },
        'Vendor deleted'
      );

      return true;
    } catch (error) {
      this.#logger.error(error, 'Failed to delete vendor');
      throw error;
    }
  }

  async addBranch(vendorId, branchData) {
    try {
      const vendor = await Vendor.findById(vendorId);

      if (!vendor) {
        this.#logger.info({ vendorId }, 'Vendor not found for adding branch');
        return null;
      }

      vendor.branches.push(branchData);
      await vendor.save();

      const newBranch = vendor.branches[vendor.branches.length - 1];

      this.#logger.info(
        {
          vendorId,
          branchId: newBranch._id,
          branchName: newBranch.branchName,
        },
        'Branch added to vendor'
      );

      // Publish branch created event
      await this.#branchEvents.publishBranchCreated(newBranch, vendorId);

      return newBranch;
    } catch (error) {
      this.#logger.error(error, 'Failed to add branch to vendor');
      throw error;
    }
  }

  async updateBranch(vendorId, branchId, branchData) {
    try {
      const vendor = await Vendor.findById(vendorId);

      if (!vendor) {
        this.#logger.info({ vendorId }, 'Vendor not found for updating branch');
        return null;
      }

      const branchIndex = vendor.branches.findIndex(
        branch => branch._id.toString() === branchId
      );

      if (branchIndex === -1) {
        this.#logger.info({ vendorId, branchId }, 'Branch not found');
        return null;
      }

      // Update branch fields
      Object.keys(branchData).forEach(key => {
        vendor.branches[branchIndex][key] = branchData[key];
      });

      await vendor.save();

      this.#logger.info(
        {
          vendorId,
          branchId,
          branchName: vendor.branches[branchIndex].branchName,
        },
        'Branch updated'
      );

      // Publish branch updated event
      await this.#branchEvents.publishBranchUpdated(
        vendor.branches[branchIndex],
        vendorId
      );

      return vendor.branches[branchIndex];
    } catch (error) {
      this.#logger.error(error, 'Failed to update branch');
      throw error;
    }
  }

  async deleteBranch(vendorId, branchId) {
    try {
      const vendor = await Vendor.findById(vendorId);

      if (!vendor) {
        this.#logger.info({ vendorId }, 'Vendor not found for deleting branch');
        return false;
      }

      const branchIndex = vendor.branches.findIndex(
        branch => branch._id.toString() === branchId
      );

      if (branchIndex === -1) {
        this.#logger.info({ vendorId, branchId }, 'Branch not found');
        return false;
      }

      const branch = vendor.branches[branchIndex];
      const { branchName } = branch;

      // Store branch info before removing it
      const deletedBranch = {
        _id: branch._id,
        branchName: branch.branchName,
      };

      vendor.branches.splice(branchIndex, 1);
      await vendor.save();

      this.#logger.info({ vendorId, branchId, branchName }, 'Branch deleted');

      // Publish branch deleted event
      await this.#branchEvents.publishBranchDeleted(deletedBranch, vendorId);

      return true;
    } catch (error) {
      this.#logger.error(error, 'Failed to delete branch');
      throw error;
    }
  }

  async getBranches(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);

      if (!vendor) {
        this.#logger.info(
          { vendorId },
          'Vendor not found for getting branches'
        );
        return null;
      }

      this.#logger.info(
        { vendorId, count: vendor.branches.length },
        'Retrieved vendor branches'
      );

      return vendor.branches;
    } catch (error) {
      this.#logger.error(error, 'Failed to get vendor branches');
      throw error;
    }
  }

  async getBranchById(vendorId, branchId) {
    try {
      const vendor = await Vendor.findById(vendorId);

      if (!vendor) {
        this.#logger.info({ vendorId }, 'Vendor not found for getting branch');
        return null;
      }

      const branch = vendor.branches.find(
        branch => branch._id.toString() === branchId
      );

      if (!branch) {
        this.#logger.info({ vendorId, branchId }, 'Branch not found');
        return null;
      }

      this.#logger.info(
        { vendorId, branchId, branchName: branch.branchName },
        'Retrieved branch'
      );

      return branch;
    } catch (error) {
      this.#logger.error(error, 'Failed to get branch');
      throw error;
    }
  }

  async getStaffProfile(userId) {
    try {
      // Call the users service to get staff profile
      const response = await axios.get(
        `${this.#usersServiceUrl}/api/staff/user/${userId}`,
        {
          headers: {
            'x-internal-call': 'true',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.#logger.error(
        error,
        `Failed to get staff profile for user ID ${userId}`
      );
      return null;
    }
  }

  async getBranchMetrics(vendorId, branchId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return null;
    }

    const branch = vendor.branches.id(branchId);
    if (!branch) {
      return null;
    }

    // If metrics don't exist yet, return defaults
    if (!branch.metrics) {
      branch.metrics = {
        totalCustomers: 0,
        totalQueues: 0,
        avgWaitTime: 0,
        avgServeTime: 0,
        weeklyCustomers: 0,
        monthlyCustomers: 0,
        peakHours: [],
        peakDays: [],
      };
      await vendor.save();
    }

    return branch.metrics;
  }

  async getBranchRatings(vendorId, branchId, page = 1, limit = 10) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return null;
    }

    const branch = vendor.branches.id(branchId);
    if (!branch) {
      return null;
    }

    // If ratings don't exist yet, initialize them
    if (!branch.ratings) {
      branch.ratings = {
        average: 0,
        count: 0,
        distribution: {
          five: 0,
          four: 0,
          three: 0,
          two: 0,
          one: 0,
        },
        reviews: [],
      };
      await vendor.save();
    }

    // Handle pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const reviews = branch.ratings.reviews || [];
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    return {
      ratings: {
        average: branch.ratings.average,
        count: branch.ratings.count,
        distribution: branch.ratings.distribution,
      },
      reviews: paginatedReviews,
      pagination: {
        total: reviews.length,
        page,
        limit,
        pages: Math.ceil(reviews.length / limit),
      },
    };
  }

  async addBranchRating(vendorId, branchId, ratingData) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    const branch = vendor.branches.id(branchId);
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    // Initialize ratings if they don't exist
    if (!branch.ratings) {
      branch.ratings = {
        average: 0,
        count: 0,
        distribution: {
          five: 0,
          four: 0,
          three: 0,
          two: 0,
          one: 0,
        },
        reviews: [],
      };
    }

    // Add the new rating to reviews
    const newRating = {
      ...ratingData,
      date: new Date(),
    };

    branch.ratings.reviews.push(newRating);

    // Update distribution counter based on rating value
    const ratingValue = Math.floor(ratingData.rating);
    switch (ratingValue) {
      case 5:
        branch.ratings.distribution.five += 1;
        break;
      case 4:
        branch.ratings.distribution.four += 1;
        break;
      case 3:
        branch.ratings.distribution.three += 1;
        break;
      case 2:
        branch.ratings.distribution.two += 1;
        break;
      case 1:
        branch.ratings.distribution.one += 1;
        break;
      default:
        break;
    }

    // Recalculate average rating
    branch.ratings.count += 1;
    const totalRatings =
      Number(branch.ratings.distribution.five) * 5 +
      Number(branch.ratings.distribution.four) * 4 +
      Number(branch.ratings.distribution.three) * 3 +
      Number(branch.ratings.distribution.two) * 2 +
      Number(branch.ratings.distribution.one) * 1;

    branch.ratings.average = totalRatings / branch.ratings.count;

    // Update vendor-level metrics as well
    if (!vendor.metrics) {
      vendor.metrics = {
        totalCustomers: 0,
        totalQueues: 0,
        avgRating: 0,
        avgWaitTime: 0,
      };
    }

    // Recalculate vendor average rating
    let vendorTotalRatings = 0;
    let vendorTotalRatingsCount = 0;

    vendor.branches.forEach(b => {
      if (b.ratings && b.ratings.count > 0) {
        vendorTotalRatings += b.ratings.average * b.ratings.count;
        vendorTotalRatingsCount += b.ratings.count;
      }
    });

    if (vendorTotalRatingsCount > 0) {
      vendor.metrics.avgRating = vendorTotalRatings / vendorTotalRatingsCount;
    }

    await vendor.save();

    return newRating;
  }

  /**
   * Respond to a rating
   * @param {string} vendorId - The vendor ID
   * @param {string} branchId - The branch ID
   * @param {string} ratingId - The rating ID
   * @param {Object} responseData - The response data
   * @returns {Promise<Object>} - The updated rating
   */
  async respondToRating(vendorId, branchId, ratingId, responseData) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    const branch = vendor.branches.id(branchId);
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    if (!branch.ratings || !branch.ratings.reviews) {
      throw new NotFoundError('No ratings found for this branch');
    }

    // Find the review to respond to
    const reviewIndex = branch.ratings.reviews.findIndex(
      review => review._id.toString() === ratingId
    );

    if (reviewIndex === -1) {
      throw new NotFoundError('Rating not found');
    }

    // Add the response
    branch.ratings.reviews[reviewIndex].staffResponse = responseData;
    await vendor.save();

    return branch.ratings.reviews[reviewIndex];
  }

  /**
   * Get vendor analytics overview
   * @param {string} vendorId - The vendor ID
   * @param {string} period - The time period for analytics
   * @returns {Promise<Object>} - Vendor analytics
   */
  async getVendorAnalyticsOverview(vendorId, period = 'month') {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    // If metrics don't exist yet, initialize them
    if (!vendor.metrics) {
      vendor.metrics = {
        totalCustomers: 0,
        totalQueues: 0,
        avgRating: 0,
        avgWaitTime: 0,
      };
      await vendor.save();
    }

    // Add branches summary
    const branchesSummary = vendor.branches.map(branch => ({
      id: branch._id,
      name: branch.branchName,
      metrics: branch.metrics || {
        totalCustomers: 0,
        totalQueues: 0,
        avgWaitTime: 0,
        avgRating: branch.ratings ? branch.ratings.average : 0,
      },
      status: branch.status,
    }));

    return {
      vendorMetrics: vendor.metrics,
      branchesSummary,
      period,
    };
  }

  /**
   * Get customer analytics
   * @param {string} vendorId - The vendor ID
   * @param {string} period - The time period for analytics
   * @param {string} branchId - Optional branch ID to filter by
   * @returns {Promise<Object>} - Customer analytics
   */
  async getCustomerAnalytics(vendorId, period = 'month', branchId = null) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    // If specific branch is requested
    if (branchId) {
      const branch = vendor.branches.id(branchId);
      if (!branch) {
        throw new NotFoundError('Branch not found');
      }

      return {
        metrics: branch.metrics || {
          totalCustomers: 0,
          weeklyCustomers: 0,
          monthlyCustomers: 0,
          peakHours: [],
          peakDays: [],
        },
        period,
      };
    }

    // Otherwise, aggregate data from all branches
    const customerAnalytics = {
      totalCustomers: 0,
      weeklyCustomers: 0,
      monthlyCustomers: 0,
      peakHours: [],
      peakDays: [],
    };

    vendor.branches.forEach(branch => {
      if (branch.metrics) {
        customerAnalytics.totalCustomers += branch.metrics.totalCustomers || 0;
        customerAnalytics.weeklyCustomers +=
          branch.metrics.weeklyCustomers || 0;
        customerAnalytics.monthlyCustomers +=
          branch.metrics.monthlyCustomers || 0;

        // Merge peak data (simplified)
        // In a real application, this would use more sophisticated aggregation
        if (branch.metrics.peakHours && branch.metrics.peakHours.length) {
          customerAnalytics.peakHours = [
            ...new Set([
              ...customerAnalytics.peakHours,
              ...branch.metrics.peakHours,
            ]),
          ];
        }

        if (branch.metrics.peakDays && branch.metrics.peakDays.length) {
          customerAnalytics.peakDays = [
            ...new Set([
              ...customerAnalytics.peakDays,
              ...branch.metrics.peakDays,
            ]),
          ];
        }
      }
    });

    return {
      metrics: customerAnalytics,
      period,
    };
  }

  /**
   * Get ratings analytics
   * @param {string} vendorId - The vendor ID
   * @param {string} period - The time period for analytics
   * @param {string} branchId - Optional branch ID to filter by
   * @returns {Promise<Object>} - Ratings analytics
   */
  async getRatingsAnalytics(vendorId, period = 'month', branchId = null) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    // If specific branch is requested
    if (branchId) {
      const branch = vendor.branches.id(branchId);
      if (!branch) {
        throw new NotFoundError('Branch not found');
      }

      return {
        ratings: branch.ratings || {
          average: 0,
          count: 0,
          distribution: {
            five: 0,
            four: 0,
            three: 0,
            two: 0,
            one: 0,
          },
        },
        period,
      };
    }

    // Otherwise, aggregate data from all branches
    const ratingsAnalytics = {
      average: 0,
      count: 0,
      distribution: {
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0,
      },
    };

    vendor.branches.forEach(branch => {
      if (branch.ratings) {
        ratingsAnalytics.count += branch.ratings.count || 0;

        // Sum up distribution
        ratingsAnalytics.distribution.five +=
          branch.ratings.distribution.five || 0;
        ratingsAnalytics.distribution.four +=
          branch.ratings.distribution.four || 0;
        ratingsAnalytics.distribution.three +=
          branch.ratings.distribution.three || 0;
        ratingsAnalytics.distribution.two +=
          branch.ratings.distribution.two || 0;
        ratingsAnalytics.distribution.one +=
          branch.ratings.distribution.one || 0;
      }
    });

    // Calculate aggregate average
    const totalRatings =
      Number(ratingsAnalytics.distribution.five) * 5 +
      Number(ratingsAnalytics.distribution.four) * 4 +
      Number(ratingsAnalytics.distribution.three) * 3 +
      Number(ratingsAnalytics.distribution.two) * 2 +
      Number(ratingsAnalytics.distribution.one) * 1;

    ratingsAnalytics.average =
      ratingsAnalytics.count > 0 ? totalRatings / ratingsAnalytics.count : 0;

    return {
      ratings: ratingsAnalytics,
      period,
    };
  }
}

module.exports = VendorService;
