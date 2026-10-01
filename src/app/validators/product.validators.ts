import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { VALIDATION_ERRORS } from '../validation-errors';
import { ProductService } from '../services/product.service';

/**
 * Sync validator: control value must be one of the allowed strings.
 * Pass `PRODUCT_STATUSES` (or any readonly string array) as the allowed list.
 */
export function statusValidator(allowed: readonly string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // let `required` handle empty
    return allowed.includes(value)
      ? null
      : { [VALIDATION_ERRORS.invalidStatus]: true };
  };
}

/**
 * Cross-field validator (applied to the FormGroup):
 * salePrice must be less than price when both are set.
 */
export function salePriceLessThanPrice(
  group: AbstractControl,
): ValidationErrors | null {
  const price = group.get('price')?.value;
  const salePrice = group.get('salePrice')?.value;
  if (price != null && salePrice != null && salePrice >= price) {
    return { [VALIDATION_ERRORS.salePriceNotLessThanPrice]: true };
  }
  return null;
}

/**
 * Async validator factory: checks product-name uniqueness via ProductService.
 * Inject the service in the component and pass it here.
 * If youu return a value inside a validation function it automatically populates the errors object due to Angulars internals.
 * Whatever object you return populates the errors. The keys are whatever you choose. The values can be true, a string, an object with details — anything truthy.
 * 
    +-------------------------------------+--------------------------------------------+
    | You return                          | Angular sets control.errors to             |
    +-------------------------------------+--------------------------------------------+
    | null                                | null (no errors — field is valid)          |
    +-------------------------------------+--------------------------------------------+
    | { nameTaken: true }                 | { nameTaken: true }                        |
    +-------------------------------------+--------------------------------------------+
    | { min: { min: 0.01, actual: 0 } }  | { min: { min: 0.01, actual: 0 } }           |
    +-------------------------------------+--------------------------------------------+
    | { foo: true, bar: true }           | { foo: true, bar: true } (multiple errors)  |
    +-------------------------------------+--------------------------------------------+
 */
export function nameUniqueValidator(
  service: ProductService,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return service.checkNameExists(control.value).pipe(
      map((exists) =>
        exists ? { [VALIDATION_ERRORS.nameTaken]: true } : null,
      ),
      first(),
    );
  };
}
