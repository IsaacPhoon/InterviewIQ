/**
 * Utility functions for formatting dates in the client's local timezone
 */

/**
 * Convert an ISO date string to a localized date string
 * @param dateString - ISO date string from the server
 * @returns Formatted date string in client's local timezone
 */
export const formatDateOnly = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
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
 * @param dateString - ISO date string from the server
 * @returns Formatted date and time string in client's local timezone
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateString;
  }
};

/**
 * Convert an ISO date string to a time-only string
 * @param dateString - ISO date string from the server
 * @returns Formatted time string in client's local timezone
 */
export const formatTimeOnly = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateString;
  }
};
