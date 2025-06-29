/**
 * Utility functions for date parsing and age calculations
 */

export class DateUtils {
  /**
   * Parse various date formats into a Date object
   */
  static parseDate(dateString: string | null): Date | null {
    if (!dateString) return null;

    // Handle ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(`${dateString}T00:00:00`);
    }

    // Handle DD MMM YYYY format
    if (/^\d{2} \w{3} \d{4}$/.test(dateString)) {
      return new Date(dateString);
    }

    // Try generic Date parsing as fallback
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Calculate age at a specific date
   */
  static calculateAge(birthDate: string | null, targetDate: string | null): number | null {
    const birth = this.parseDate(birthDate);
    const target = this.parseDate(targetDate);

    if (!birth || !target) return null;

    let age = target.getFullYear() - birth.getFullYear();
    const monthDiff = target.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}