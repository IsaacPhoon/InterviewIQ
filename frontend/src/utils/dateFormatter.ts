/**
 * Utility functions for formatting dates in the client's local timezone
 */

/**
 * Parse a date string from the backend (assumed to be UTC) and return a Date object
 * @param dateString - ISO date string from the server (UTC)
 * @returns Date object in UTC
 */
const parseUTCDate = (dateString: string): Date => {
  // If the date string doesn't end with 'Z', append it to indicate UTC
  const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  return new Date(utcString);
};

/**
 * Convert an ISO date string to a localized date string
 * @param dateString - ISO date string from the server (UTC)
 * @returns Formatted date string in client's local timezone
 */
export const formatDateOnly = (dateString: string): string => {
  try {
    return parseUTCDate(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Convert an ISO date string to a full localized date and time string
 * @param dateString - ISO date string from the server (UTC)
 * @returns Formatted date and time string in client's local timezone
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return parseUTCDate(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

/**
 * Convert an ISO date string to a time-only string
 * @param dateString - ISO date string from the server (UTC)
 * @returns Formatted time string in client's local timezone
 */
export const formatTimeOnly = (dateString: string): string => {
  try {
    return parseUTCDate(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};
