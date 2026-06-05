// Category → PL Cost Type mapping
// Each category has an array of { nr, name } objects for the dropdown
export const CATEGORY_COST_TYPES = {
  'Travel': [
    { nr: '6010', name: 'Rental Car / Car Cost' },
    { nr: '6020', name: 'Flight Cost' },
    { nr: '6030', name: 'Daily Travel Expense' },
    { nr: '6040', name: 'Hotels' },
  ],
  'Office': [
    { nr: '6110', name: 'Office Supplies / IT Equipment' },
  ],
  'Meals & Entertainment': [
    { nr: '6540', name: 'Food and Beverage (F&B)' },
  ],
  'Telecommunication': [
    { nr: '6210', name: 'Phone Cost' },
    { nr: '6220', name: 'Internet / Data' },
    { nr: '6230', name: 'Roaming' },
  ],
  'Marketing': [
    { nr: '6310', name: 'Exhibition' },
    { nr: '6320', name: 'Brand Awareness' },
    { nr: '6330', name: 'Public Relations' },
    { nr: '6340', name: 'Sales Promotion' },
    { nr: '6350', name: 'Sample Free-of-Charge' },
    { nr: '6360', name: 'Customer Gifts' },
    { nr: '6370', name: 'Sales Customer Events' },
  ],
  'Logistics': [
    { nr: '6410', name: 'Sales Outbound Freight' },
    { nr: '6420', name: 'Delivery Cost' },
  ],
};

// Ordered list of categories for dropdown display
export const CATEGORIES = Object.keys(CATEGORY_COST_TYPES);

/**
 * Get the list of PL cost types for a given category.
 * Returns an array of { nr, name } objects.
 */
export const getCostTypesForCategory = (category) => {
  return CATEGORY_COST_TYPES[category] || [];
};

/**
 * Get the cost type name for a given category and cost type number.
 */
export const getCostTypeName = (category, costTypeNr) => {
  const costTypes = getCostTypesForCategory(category);
  const found = costTypes.find(ct => ct.nr === costTypeNr);
  return found ? found.name : '';
};

/**
 * Get the default (first) cost type for a given category.
 * Returns { nr, name } or null if none found.
 */
export const getDefaultCostType = (category) => {
  const costTypes = getCostTypesForCategory(category);
  return costTypes.length > 0 ? costTypes[0] : null;
};
