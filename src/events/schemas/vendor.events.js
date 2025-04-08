const BRANCH_CREATED = {
  type: 'object',
  required: ['vendorId', 'branchId', 'branchName'],
  properties: {
    vendorId: { type: 'string' },
    branchId: { type: 'string' },
    branchName: { type: 'string' },
    branchCode: { type: 'string' },
    status: { type: 'string' },
    createdAt: { type: 'object' },
  },
};

const BRANCH_UPDATED = {
  type: 'object',
  required: ['vendorId', 'branchId', 'branchName'],
  properties: {
    vendorId: { type: 'string' },
    branchId: { type: 'string' },
    branchName: { type: 'string' },
    branchCode: { type: 'string' },
    status: { type: 'string' },
    updatedAt: { type: 'object' },
  },
};

const BRANCH_DELETED = {
  type: 'object',
  required: ['vendorId', 'branchId'],
  properties: {
    vendorId: { type: 'string' },
    branchId: { type: 'string' },
  },
};

module.exports = {
  BRANCH_CREATED,
  BRANCH_UPDATED,
  BRANCH_DELETED,
};
