import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ProductService);
  });

  describe('checkNameExists', () => {
    it('should return true for an existing name (case-insensitive)', async () => {
      expect(await firstValueFrom(service.checkNameExists('widget pro'))).toBe(true);
      expect(await firstValueFrom(service.checkNameExists('GADGET MAX'))).toBe(true);
    });

    it('should return false for a novel name', async () => {
      expect(await firstValueFrom(service.checkNameExists('Brand New'))).toBe(false);
    });
  });

  describe('saveProduct', () => {
    it('should return the product unchanged', async () => {
      const product = {
        name: 'Test',
        description: 'A test product with a sufficiently long description for validation',
        price: 10,
        salePrice: 5,
        status: 'Pending' as const,
      };
      const saved = await firstValueFrom(service.saveProduct(product));
      expect(saved).toEqual(product);
    });
  });
});
