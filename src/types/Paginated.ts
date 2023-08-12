export default interface Paginated<T> {
  list: T[];
  currentPage: number;
  totalCount: number;
  totalPages: number;
  itemsPerPage: number;
};
