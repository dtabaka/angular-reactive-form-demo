# Product Reactive Form Demo

Angular reactive form demo with:

- Required validators
- MinLength validator (description ≥ 50 chars)
- Min validator (price/salePrice > 0)
- Cross-field validator (salePrice < price)
- Async validator (name uniqueness via mock service)
- Custom validator (status must be Pending, Approved, or Rejected)
- Routing: root route shows the Product Form

## Folder structure

- `src/app/app.config.ts` — application configuration (standalone bootstrap)
- `src/app/app.routes.ts` — routing configuration
- `src/app/app.component.ts` — root component
- `src/app/app.component.html` — root template
- `src/app/models/product.model.ts` — Product interface
- `src/app/services/product.service.ts` — mock ProductService
- `src/app/components/product-form/product-form.component.ts` — reactive form logic
- `src/app/components/product-form/product-form.component.html` — form template
- `src/app/components/product-form/product-form.component.css` — basic styles

## Validators

- **Required**: name, price, status
- **MinLength**: description must be at least 50 characters
- **Min**: price and salePrice must be greater than 0
- **Cross-field**: salePrice must be less than price
- **Async**: product name must be unique (mocked via ProductService)
- **Custom**: status must be one of `Pending`, `Approved`, `Rejected`

## Modify custom status validator

Open `src/app/components/product-form/product-form.component.ts` and edit `statusValidator`:

```ts
statusValidator(control: AbstractControl): ValidationErrors | null {
  const allowed = ['Pending', 'Approved', 'Rejected'];
  const value = control.value;
  if (!value) return null;
  return allowed.includes(value) ? null : { invalidStatus: true };
}
