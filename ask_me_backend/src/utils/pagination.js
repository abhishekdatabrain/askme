/**
 * Helper to sanitize pagination parameters and construct standardized pagination metadata.
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page || 1, 10));
  const rawLimit = parseInt(query.limit || 10, 10);
  const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 10 : rawLimit), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const buildPaginationMeta = (count, page, limit) => {
  const totalCount = count;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const currentPage = page > totalPages ? totalPages : page;

  return {
    page: currentPage,
    limit,
    totalPages,
    totalCount,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
