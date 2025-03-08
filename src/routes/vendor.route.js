const { Router } = require('express');

const VendorController = require('#vendors/controllers/vendor.controller.js');

class VendorRoutes {
  #router;
  #vendorController;

  constructor() {
    this.#router = Router();
    this.#vendorController = new VendorController();
  }

  setup() {
    // Vendor routes
    this.#router.post('/', this.#vendorController.createVendor);
    this.#router.get('/', this.#vendorController.getVendors);
    this.#router.get('/:vendorId', this.#vendorController.getVendorById);
    this.#router.put('/:vendorId', this.#vendorController.updateVendor);
    this.#router.delete('/:vendorId', this.#vendorController.deleteVendor);

    // Branch routes
    this.#router.get('/:vendorId/branches', this.#vendorController.getBranches);
    this.#router.post('/:vendorId/branches', this.#vendorController.addBranch);
    this.#router.get(
      '/:vendorId/branches/:branchId',
      this.#vendorController.getBranchById
    );
    this.#router.put(
      '/:vendorId/branches/:branchId',
      this.#vendorController.updateBranch
    );
    this.#router.delete(
      '/:vendorId/branches/:branchId',
      this.#vendorController.deleteBranch
    );

    return this.#router;
  }
}

module.exports = VendorRoutes;
