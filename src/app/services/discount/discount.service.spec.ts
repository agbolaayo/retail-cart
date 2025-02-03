import { TestBed } from '@angular/core/testing';
import { DiscountService } from './discount.service';

describe('DiscountService', () => {
  let service: DiscountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateDiscount', () => {
    it('should return 10% of the total for code SAVE10 (case insensitive)', () => {
      const total = 100;
      const discount = service.calculateDiscount(total, 'SAVE10');
      expect(discount).toBe(10);
    });

    it('should return a flat $5 discount for code SAVE5 (case insensitive)', () => {
      const total = 50;
      const discount = service.calculateDiscount(total, 'save5');
      expect(discount).toBe(5);
    });

    it('should return 0 discount for an unrecognized code', () => {
      const total = 100;
      const discount = service.calculateDiscount(total, 'INVALID');
      expect(discount).toBe(0);
    });

    it('should trim spaces from the discount code', () => {
      const total = 200;
      const discount = service.calculateDiscount(total, '  SAVE10  ');
      expect(discount).toBe(20);
    });
  });

  describe('isValidCode', () => {
    it('should return true for code SAVE10', () => {
      expect(service.isValidCode('SAVE10')).toBeTrue();
    });

    it('should return true for code SAVE5 (case insensitive)', () => {
      expect(service.isValidCode('save5')).toBeTrue();
    });

    it('should return false for an invalid code', () => {
      expect(service.isValidCode('INVALID')).toBeFalse();
    });

    it('should trim spaces and validate the code correctly', () => {
      expect(service.isValidCode('  SAVE10 ')).toBeTrue();
    });
  });
});
