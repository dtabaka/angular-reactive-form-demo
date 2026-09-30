/** Centralized error keys for custom validators — single source of truth. */
export const VALIDATION_ERRORS = {
  nameTaken: 'nameTaken',
  invalidStatus: 'invalidStatus',
  salePriceNotLessThanPrice: 'salePriceNotLessThanPrice',
} as const;
