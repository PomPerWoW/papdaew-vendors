const BRANCH_CREATED = {
  type: 'object',
  required: ['id', 'vendorId', 'branchName'],
  properties: {
    id: { type: 'string' },
    vendorId: { type: 'string' },
    branchName: { type: 'string' },
    branchCode: { type: 'string' },
    status: { type: 'string' },
    createdAt: { type: 'object' },
  },
};

const BRANCH_UPDATED = {
  type: 'object',
  required: ['id', 'vendorId', 'branchName'],
  properties: {
    id: { type: 'string' },
    vendorId: { type: 'string' },
    branchName: { type: 'string' },
    branchCode: { type: 'string' },
    status: { type: 'string' },
    updatedAt: { type: 'object' },
  },
};

const BRANCH_DELETED = {
  type: 'object',
  required: ['id', 'vendorId'],
  properties: {
    id: { type: 'string' },
    vendorId: { type: 'string' },
    branchName: { type: 'string' },
  },
};

module.exports = {
  BRANCH_CREATED,
  BRANCH_UPDATED,
  BRANCH_DELETED,
};
