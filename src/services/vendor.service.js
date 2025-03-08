const { PinoLogger } = require('@papdaew/shared');

const Vendor = require('#vendors/models/vendor.model.js');

class VendorService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'Vendor Service',
    });
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

      const { branchName } = vendor.branches[branchIndex];
      vendor.branches.splice(branchIndex, 1);
      await vendor.save();

      this.#logger.info({ vendorId, branchId, branchName }, 'Branch deleted');

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
}

module.exports = VendorService;
