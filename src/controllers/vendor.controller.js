const { StatusCodes } = require('http-status-codes');
const {
  PinoLogger,
  asyncHandler,
  NotFoundError,
  BadRequestError,
} = require('@papdaew/shared');

const VendorService = require('#vendors/services/vendor.service.js');

class VendorController {
  #logger;
  #vendorService;

  constructor() {
    this.#vendorService = new VendorService();
    this.#logger = new PinoLogger().child({
      service: 'Vendor Controller',
    });
  }

  createVendor = asyncHandler(async (req, res) => {
    const { businessName, businessType, contactEmail, contactPhone } = req.body;

    if (!businessName || !businessType || !contactEmail || !contactPhone) {
      this.#logger.error(
        `Missing required fields: businessName, businessType, contactEmail, contactPhone: ${JSON.stringify(
          req.body
        )}`
      );
      throw new BadRequestError(
        'Missing required fields: businessName, businessType, contactEmail, contactPhone'
      );
    }

    const vendor = await this.#vendorService.createVendor(req.body);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Vendor created successfully',
      data: vendor,
    });
  });

  getVendors = asyncHandler(async (req, res) => {
    const { limit, offset, businessType, status } = req.query;

    const options = {
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
      businessType,
      status,
    };

    const { vendors, total } = await this.#vendorService.getVendors(options);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: vendors,
      meta: {
        total,
        limit: options.limit,
        offset: options.offset,
      },
    });
  });

  getVendorById = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;

    const vendor = await this.#vendorService.getVendorById(vendorId);

    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: vendor,
    });
  });

  updateVendor = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;

    const vendor = await this.#vendorService.updateVendor(vendorId, req.body);

    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Vendor updated successfully',
      data: vendor,
    });
  });

  deleteVendor = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;

    const success = await this.#vendorService.deleteVendor(vendorId);

    if (!success) {
      throw new NotFoundError('Vendor not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Vendor deleted successfully',
    });
  });

  // Branch management
  addBranch = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const { branchName, branchCode, locationId, contactPhone } = req.body;

    if (!branchName || !branchCode || !locationId || !contactPhone) {
      this.#logger.error(
        `Missing required fields: branchName, branchCode, locationId, contactPhone: ${JSON.stringify(
          req.body
        )}`
      );
      throw new BadRequestError(
        'Missing required fields: branchName, branchCode, locationId, contactPhone'
      );
    }

    const branch = await this.#vendorService.addBranch(vendorId, req.body);

    if (!branch) {
      throw new NotFoundError('Vendor not found');
    }

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Branch added successfully',
      data: branch,
    });
  });

  updateBranch = asyncHandler(async (req, res) => {
    const { vendorId, branchId } = req.params;

    const branch = await this.#vendorService.updateBranch(
      vendorId,
      branchId,
      req.body
    );

    if (!branch) {
      throw new NotFoundError('Vendor or branch not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Branch updated successfully',
      data: branch,
    });
  });

  deleteBranch = asyncHandler(async (req, res) => {
    const { vendorId, branchId } = req.params;

    const success = await this.#vendorService.deleteBranch(vendorId, branchId);

    if (!success) {
      throw new NotFoundError('Vendor or branch not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Branch deleted successfully',
    });
  });

  getBranches = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;

    // Get staff information from headers
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    const isStaffUser = userRole === 'STAFF';

    // Get branches
    const branches = await this.#vendorService.getBranches(vendorId);

    if (branches === null) {
      throw new NotFoundError('Vendor not found');
    }

    // If user is a staff member and not root (checked by middleware)
    // Check if specific branch access is required
    if (isStaffUser && userId) {
      // Get staff profile to check if they're root
      const staffProfile = await this.#vendorService.getStaffProfile(userId);

      // If not root, filter branches to only include their assigned branch
      if (staffProfile && !staffProfile.isRoot && staffProfile.branchId) {
        // Filter branches to only include their assigned branch
        const filteredBranches = branches.filter(
          branch => branch._id.toString() === staffProfile.branchId.toString()
        );

        return res.status(StatusCodes.OK).json({
          status: 'success',
          data: filteredBranches,
        });
      }
    }

    // Otherwise return all branches
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: branches,
    });
  });

  getBranchById = asyncHandler(async (req, res) => {
    const { vendorId, branchId } = req.params;

    const branch = await this.#vendorService.getBranchById(vendorId, branchId);

    if (!branch) {
      throw new NotFoundError('Vendor or branch not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: branch,
    });
  });

  // New methods for branch metrics
  getBranchMetrics = asyncHandler(async (req, res) => {
    const { vendorId, branchId } = req.params;

    const metrics = await this.#vendorService.getBranchMetrics(
      vendorId,
      branchId
    );

    if (!metrics) {
      throw new NotFoundError('Vendor or branch not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: metrics,
    });
  });

  // New methods for branch ratings
  getBranchRatings = asyncHandler(async (req, res) => {
    const { vendorId, branchId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await this.#vendorService.getBranchRatings(
      vendorId,
      branchId,
      parseInt(page),
      parseInt(limit)
    );

    if (!ratings) {
      throw new NotFoundError('Vendor or branch not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: ratings,
    });
  });

  addBranchRating = asyncHandler(async (req, res) => {
    const { vendorId, branchId } = req.params;
    const { userId, rating, comment } = req.body;

    if (!userId || !rating) {
      throw new BadRequestError('User ID and rating are required');
    }

    const newRating = await this.#vendorService.addBranchRating(
      vendorId,
      branchId,
      {
        userId,
        rating,
        comment,
      }
    );

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: newRating,
    });
  });

  respondToRating = asyncHandler(async (req, res) => {
    const { vendorId, branchId, ratingId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      throw new BadRequestError('Response comment is required');
    }

    const updatedRating = await this.#vendorService.respondToRating(
      vendorId,
      branchId,
      ratingId,
      { comment, date: new Date() }
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: updatedRating,
    });
  });

  // Vendor analytics endpoints
  getVendorAnalyticsOverview = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const { period = 'month' } = req.query; // 'day', 'week', 'month', 'year'

    const analytics = await this.#vendorService.getVendorAnalyticsOverview(
      vendorId,
      period
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: analytics,
    });
  });

  getCustomerAnalytics = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const { period = 'month', branchId } = req.query;

    const analytics = await this.#vendorService.getCustomerAnalytics(
      vendorId,
      period,
      branchId
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: analytics,
    });
  });

  getRatingsAnalytics = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const { period = 'month', branchId } = req.query;

    const analytics = await this.#vendorService.getRatingsAnalytics(
      vendorId,
      period,
      branchId
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: analytics,
    });
  });
}

module.exports = VendorController;
