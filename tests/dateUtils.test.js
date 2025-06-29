import { DateUtils } from '../src/utils/dateUtils.js';

describe('DateUtils', () => {
  describe('parseDate', () => {
    test('should parse ISO date format', () => {
      const date = DateUtils.parseDate('1990-05-15');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(1990);
      expect(date?.getMonth()).toBe(4); // 0-indexed
      expect(date?.getDate()).toBe(15);
    });

    test('should return null for invalid date', () => {
      const date = DateUtils.parseDate('invalid-date');
      expect(date).toBeNull();
    });

    test('should return null for null input', () => {
      const date = DateUtils.parseDate(null);
      expect(date).toBeNull();
    });
  });

  describe('calculateAge', () => {
    test('should calculate age correctly', () => {
      const age = DateUtils.calculateAge('1990-05-15', '2020-05-15');
      expect(age).toBe(30);
    });

    test('should handle birthday not yet reached', () => {
      const age = DateUtils.calculateAge('1990-05-15', '2020-05-14');
      expect(age).toBe(29);
    });

    test('should return null for invalid dates', () => {
      const age = DateUtils.calculateAge('invalid', '2020-05-15');
      expect(age).toBeNull();
    });

    test('should return null for null inputs', () => {
      const age = DateUtils.calculateAge(null, '2020-05-15');
      expect(age).toBeNull();
    });
  });
});