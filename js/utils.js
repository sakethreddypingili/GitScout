/**
 * js/utils.js
 * Numerical formatters and ISO calendar date parser.
 */

/**
 * Formats a raw number to a compact abbreviated format (e.g. 54300 to 54.3k)
 * @param {number} num - Numerical value
 * @returns {string} Abbreviated string representation
 */
function formatCompactNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (num >= 1000000) {
    return (Math.round(num / 100000) / 10).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (Math.round(num / 100) / 10).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

/**
 * Parses an ISO 8601 string to a locally readable date format.
 * @param {string} isoString - ISO string input
 * @returns {string} Formatted localized date
 */
function parseCalendarDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
}
