import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, PRODUCT_STATUSES } from '../../models/product.model';
import { VALIDATION_ERRORS } from '../../validation-errors';
import {
  nameUniqueValidator,
  salePriceLessThanPrice,
  statusValidator,
} from '../../validators/product.validators';

/** Strongly-typed shape of the product reactive form. */
interface ProductForm {
  name: FormControl<string>;
  description: FormControl<string>;
  price: FormControl<number | null>;
  salePrice: FormControl<number | null>;
  status: FormControl<string>;
}

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);

  /** Expose constants to the template. */
  readonly errors = VALIDATION_ERRORS;
  readonly statuses = PRODUCT_STATUSES;

  /** Reactive state. */
  savedProduct = signal<Product | null>(null);

  /** Strongly-typed reactive form — initialized at construction time. */
  productForm = new FormGroup<ProductForm>(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
        asyncValidators: [nameUniqueValidator(this.productService)],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(50)],
      }),
      price: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0.01)],
      }),
      salePrice: new FormControl<number | null>(null, {
        validators: [Validators.min(0.01)],
      }),
      status: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, statusValidator(PRODUCT_STATUSES)],
      }),
    },
    { validators: salePriceLessThanPrice },
  );

  // ─── Helpers ─────────────────────────────────────────────────────────

  /** Shortcut for template access. */
  get f() {
    return this.productForm.controls;
  }

  /** Check whether a control has a specific error and has been touched. */
  hasError(field: string, error: string): boolean {
    const control = this.productForm.get(field);
    return !!control?.hasError(error) && control.touched;
  }

  /** Check whether a form-level (cross-field) error is active and relevant fields are touched. */
  hasFormError(error: string, ...fields: string[]): boolean {
    const hasErr = this.productForm.hasError(error);
    const allTouched = fields.every(
      (f) => this.productForm.get(f)?.touched,
    );
    return hasErr && allTouched;
  }

  onSubmit(): void {
    if (this.productForm.invalid) { // checks if any validator (required, min, minlength, custom, async) is currently failing. If so, don't save
      this.productForm.markAllAsTouched(); // marks every control as touched, even ones the user never interacted with. This is what makes all the error messages appear at once. So it's the "show me everything that's wrong" moment — the user clicks Save, every invalid field lights up red, and nothing is sent to the server.
      return;
    }

    const product = this.productForm.getRawValue() as Product;
    this.productService
      .saveProduct(product)
      .pipe(takeUntilDestroyed(this.destroyRef)) //DestroyRef is an Angular injectable that lets you run cleanup logic when a component (or any injector-scoped context) is destroyed. It's the modern replacement for the ngOnDestroy lifecycle hook.
      .subscribe((saved) => this.savedProduct.set(saved));
  }

  onReset(): void {
    this.savedProduct.set(null);
    this.productForm.reset();
  }
}
