const { PinoLogger } = require('@papdaew/shared');

const MessageBroker = require('#vendors/configs/messageBroker.config.js');

class BranchEvents {
  #logger;
  #messageBroker;

  constructor() {
    this.#messageBroker = new MessageBroker();
    this.#logger = new PinoLogger().child({
      service: 'Branch Events',
    });
  }

  async publishBranchCreated(branch, vendorId) {
    try {
      await this.#messageBroker.publishDirect(
        'branch.created',
        'BRANCH_CREATED',
        {
          id: branch._id.toString(),
          vendorId: vendorId.toString(),
          branchName: branch.branchName,
          branchCode: branch.branchCode,
          status: branch.status,
          createdAt: branch.createdAt,
        },
        'Branch created event published successfully'
      );
      this.#logger.info(
        `Published branch.created event for branch ${branch._id}`
      );
    } catch (error) {
      this.#logger.error(
        `Error publishing branch.created event: ${error.message}`
      );
    }
  }

  async publishBranchUpdated(branch, vendorId) {
    try {
      await this.#messageBroker.publishDirect(
        'branch.updated',
        'BRANCH_UPDATED',
        {
          id: branch._id.toString(),
          vendorId: vendorId.toString(),
          branchName: branch.branchName,
          branchCode: branch.branchCode,
          status: branch.status,
          updatedAt: branch.updatedAt,
        },
        'Branch updated event published successfully'
      );
      this.#logger.info(
        `Published branch.updated event for branch ${branch._id}`
      );
    } catch (error) {
      this.#logger.error(
        `Error publishing branch.updated event: ${error.message}`
      );
    }
  }

  async publishBranchDeleted(branch, vendorId) {
    try {
      await this.#messageBroker.publishDirect(
        'branch.deleted',
        'BRANCH_DELETED',
        {
          id: branch._id.toString(),
          vendorId: vendorId.toString(),
          branchName: branch.branchName,
        },
        'Branch deleted event published successfully'
      );
      this.#logger.info(
        `Published branch.deleted event for branch ${branch._id}`
      );
    } catch (error) {
      this.#logger.error(
        `Error publishing branch.deleted event: ${error.message}`
      );
    }
  }
}

module.exports = BranchEvents;
