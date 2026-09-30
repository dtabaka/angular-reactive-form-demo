import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../services/product.service';
import { of } from 'rxjs';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;

  const mockProductService = {
    checkNameExists: (_name: string) => of(false),
    saveProduct: (product: any) => of(product),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty/null values', () => {
    const { name, description, price, salePrice, status } =
      component.productForm.controls;
    expect(name.value).toBe('');
    expect(description.value).toBe('');
    expect(price.value).toBeNull();
    expect(salePrice.value).toBeNull();
    expect(status.value).toBe('');
  });

  it('should mark name as required', () => {
    const name = component.productForm.controls.name;
    expect(name.hasError('required')).toBe(true);
  });

  it('should require description of at least 50 characters', () => {
    const desc = component.productForm.controls.description;
    desc.setValue('short');
    expect(desc.hasError('minlength')).toBe(true);

    desc.setValue('A'.repeat(50));
    expect(desc.hasError('minlength')).toBe(false);
  });

  it('should require price > 0', () => {
    const price = component.productForm.controls.price;
    price.setValue(0);
    expect(price.hasError('min')).toBe(true);

    price.setValue(9.99);
    expect(price.hasError('min')).toBe(false);
  });

  it('should flag salePrice >= price via cross-field validator', () => {
    component.productForm.controls.price.setValue(50);
    component.productForm.controls.salePrice.setValue(60);
    expect(
      component.productForm.hasError('salePriceNotLessThanPrice'),
    ).toBe(true);

    component.productForm.controls.salePrice.setValue(30);
    expect(
      component.productForm.hasError('salePriceNotLessThanPrice'),
    ).toBe(false);
  });

  it('should reject invalid status values', () => {
    const status = component.productForm.controls.status;
    status.setValue('Draft');
    expect(status.hasError('invalidStatus')).toBe(true);

    status.setValue('Approved');
    expect(status.hasError('invalidStatus')).toBe(false);
  });

  it('should not submit when the form is invalid', () => {
    component.onSubmit();
    expect(component.savedProduct()).toBeNull();
  });

  it('should save a valid product', async () => {
    component.productForm.controls.name.setValue('New Widget');
    component.productForm.controls.description.setValue(
      'A sufficiently long description for validation that exceeds 50 characters easily',
    );
    component.productForm.controls.price.setValue(100);
    component.productForm.controls.salePrice.setValue(80);
    component.productForm.controls.status.setValue('Pending');

    // Wait for async validator to settle
    component.productForm.controls.name.updateValueAndValidity();
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();
    expect(component.savedProduct()).toBeTruthy();
    expect(component.savedProduct()?.name).toBe('New Widget');
  });

  it('should reset the form and clear state', () => {
    component.onReset();
    expect(component.savedProduct()).toBeNull();
  });
});
