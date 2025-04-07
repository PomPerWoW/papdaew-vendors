const { Router } = require('express');

const UserMiddleware = require('#vendors/middlewares/user.middleware.js');
const VendorController = require('#vendors/controllers/vendor.controller.js');

class VendorRoutes {
  #router;
  #vendorController;
  #userMiddleware;

  constructor() {
    this.#router = Router();
    this.#vendorController = new VendorController();
    this.#userMiddleware = new UserMiddleware();
  }

  setup() {
    // Vendor routes
    this.#router.post('/', this.#vendorController.createVendor);
    this.#router.get('/', this.#vendorController.getVendors);
    this.#router.get('/:vendorId', this.#vendorController.getVendorById);
    this.#router.put('/:vendorId', this.#vendorController.updateVendor);
    this.#router.delete('/:vendorId', this.#vendorController.deleteVendor);

    // Branch routes with branch access middleware
    this.#router.get(
      '/:vendorId/branches',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.getBranches
    );
    this.#router.post(
      '/:vendorId/branches',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.addBranch
    );
    this.#router.get(
      '/:vendorId/branches/:branchId',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.getBranchById
    );
    this.#router.put(
      '/:vendorId/branches/:branchId',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.updateBranch
    );
    this.#router.delete(
      '/:vendorId/branches/:branchId',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.deleteBranch
    );

    // New routes for branch metrics
    this.#router.get(
      '/:vendorId/branches/:branchId/metrics',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.getBranchMetrics
    );

    // New routes for ratings
    this.#router.get(
      '/:vendorId/branches/:branchId/ratings',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.getBranchRatings
    );

    this.#router.post(
      '/:vendorId/branches/:branchId/ratings',
      this.#vendorController.addBranchRating
    );

    this.#router.post(
      '/:vendorId/branches/:branchId/ratings/:ratingId/respond',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.respondToRating
    );

    // Vendor analytics endpoints
    this.#router.get(
      '/:vendorId/analytics/overview',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.getVendorAnalyticsOverview
    );

    this.#router.get(
      '/:vendorId/analytics/customers',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.getCustomerAnalytics
    );

    this.#router.get(
      '/:vendorId/analytics/ratings',
      this.#userMiddleware.checkBranchAccess,
      this.#vendorController.getRatingsAnalytics
    );

    return this.#router;
  }
}

module.exports = VendorRoutes;
