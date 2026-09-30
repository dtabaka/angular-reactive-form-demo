import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { firstValueFrom, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  nameUniqueValidator,
  salePriceLessThanPrice,
  statusValidator,
} from './product.validators';
import { VALIDATION_ERRORS } from '../validation-errors';
import { ProductService } from '../services/product.service';

describe('statusValidator', () => {
  const allowed = ['Pending', 'Approved', 'Rejected'];
  const validator = statusValidator(allowed);

  it('should return null for an allowed value', () => {
    const control = new FormControl('Pending');
    expect(validator(control)).toBeNull();
  });

  it('should return null for empty value (let required handle it)', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('should return invalidStatus error for a disallowed value', () => {
    const control = new FormControl('Draft');
    expect(validator(control)).toEqual({
      [VALIDATION_ERRORS.invalidStatus]: true,
    });
  });
});

describe('salePriceLessThanPrice', () => {
  function buildGroup(price: number | null, salePrice: number | null) {
    return new FormGroup({
      price: new FormControl(price),
      salePrice: new FormControl(salePrice),
    });
  }

  it('should return null when salePrice < price', () => {
    expect(salePriceLessThanPrice(buildGroup(100, 80))).toBeNull();
  });

  it('should return error when salePrice >= price', () => {
    expect(salePriceLessThanPrice(buildGroup(100, 100))).toEqual({
      [VALIDATION_ERRORS.salePriceNotLessThanPrice]: true,
    });
    expect(salePriceLessThanPrice(buildGroup(100, 120))).toEqual({
      [VALIDATION_ERRORS.salePriceNotLessThanPrice]: true,
    });
  });

  it('should return null when either value is null', () => {
    expect(salePriceLessThanPrice(buildGroup(null, 80))).toBeNull();
    expect(salePriceLessThanPrice(buildGroup(100, null))).toBeNull();
  });
});

describe('nameUniqueValidator', () => {
  it('should return nameTaken error when service says name exists', async () => {
    const mockService = {
      checkNameExists: (_name: string) => of(true).pipe(delay(0)),
    } as unknown as ProductService;

    const validator = nameUniqueValidator(mockService);
    const control = new FormControl('Widget Pro');
    const result = await firstValueFrom(
      validator(control) as Observable<ValidationErrors | null>,
    );
    expect(result).toEqual({ [VALIDATION_ERRORS.nameTaken]: true });
  });

  it('should return null when service says name is available', async () => {
    const mockService = {
      checkNameExists: (_name: string) => of(false).pipe(delay(0)),
    } as unknown as ProductService;

    const validator = nameUniqueValidator(mockService);
    const control = new FormControl('Unique Name');
    const result = await firstValueFrom(
      validator(control) as Observable<ValidationErrors | null>,
    );
    expect(result).toBeNull();
  });
});
