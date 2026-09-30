import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Names that already "exist" in the mock back-end. */
  private readonly existingNames = [
    'Widget Pro',
    'Gadget Max',
    'Super Gizmo',
  ];

  /**
   * Mock API: returns `true` when the name is already taken.
   * Simulates a 500 ms network round-trip.
   */
  checkNameExists(name: string): Observable<boolean> {
    const taken = this.existingNames
      .map((n) => n.toLowerCase())
      .includes(name.trim().toLowerCase());
    return of(taken).pipe(delay(500));
  }

  /** Mock submit — returns the saved product after a short delay. */
  saveProduct(product: Product): Observable<Product> {
    return of(product).pipe(delay(300));
  }
}
