import { PaginationFilter } from './pagination-filter';

export interface SecuritiesFilter extends PaginationFilter {
  name?: string;
  types?: string[];
  currencies?: string[];
  isPrivate?: boolean;
}
