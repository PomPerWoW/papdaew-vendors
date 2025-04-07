const axios = require('axios');
const {
  ForbiddenError,
  PinoLogger,
  UnauthorizedError,
} = require('@papdaew/shared');

class UserMiddleware {
  #logger;
  #usersServiceUrl;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'User Middleware (Vendors)',
    });
    this.#usersServiceUrl = process.env.USERS_SERVICE_URL;
  }

  internalAuthMiddleware = (req, _res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
      throw new UnauthorizedError('Missing user authentication headers');
    }

    req.user = {
      id: userId,
      role: userRole,
    };

    next();
  };

  checkBranchAccess = async (req, _res, next) => {
    try {
      const userId = req.headers['x-user-id'];
      const userRole = req.headers['x-user-role'];

      // If user is not a staff, proceed (other middlewares will handle auth)
      if (!userId || userRole !== 'STAFF') {
        return next();
      }

      // Get the branch ID from request params or query
      const branchId = req.params.branchId || req.query.branchId;

      // If no branch ID is specified, proceed
      if (!branchId) {
        return next();
      }

      // Get staff profile from user service
      try {
        const response = await axios.get(
          `${this.#usersServiceUrl}/api/staff/user/${userId}`,
          {
            headers: {
              'x-user-id': userId,
              'x-user-role': userRole,
            },
          }
        );

        const staff = response.data.data;

        // If no staff profile found, throw error
        if (!staff) {
          throw new ForbiddenError('Staff profile not found');
        }

        // If staff is root, they can access any branch
        if (staff.isRoot) {
          return next();
        }

        // If staff is not root, check if the branch ID matches their assigned branch
        if (staff.branchId && staff.branchId.toString() === branchId) {
          return next();
        }

        // If branch doesn't match, deny access
        throw new ForbiddenError('You do not have access to this branch');
      } catch (error) {
        this.#logger.error(error, 'Error checking staff branch access');
        if (error instanceof ForbiddenError) {
          throw error;
        }
        throw new ForbiddenError('Failed to verify branch access permissions');
      }
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UserMiddleware;
