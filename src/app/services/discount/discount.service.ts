import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  /**
   * Given a discount code and the current total,
   * returns the discount amount.
   */
  calculateDiscount(total: number, code: string): number {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode === 'SAVE10') {
      return total * 0.10;
    }
    if (trimmedCode === 'SAVE5') {
      return 5;
    }
    return 0;
  }

  /**
   * Validates whether the provided code is recognized.
   */
  isValidCode(code: string): boolean {
    const trimmedCode = code.trim().toUpperCase();
    return trimmedCode === 'SAVE10' || trimmedCode === 'SAVE5';
  }
}
