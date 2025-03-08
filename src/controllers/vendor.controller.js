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

    const branches = await this.#vendorService.getBranches(vendorId);

    if (branches === null) {
      throw new NotFoundError('Vendor not found');
    }

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
}

module.exports = VendorController;
