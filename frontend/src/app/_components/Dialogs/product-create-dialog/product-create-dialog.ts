import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, computed, ElementRef, inject, NgZone, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subscription, take } from 'rxjs';
import { ProductsCreateDTO } from '../../../_interfaces/products-create-dto';
import { DialogCreateRepository } from '../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../_repositories/toast-repository';
import { ProductService } from '../../../_services/product-service';
import { capitalizeWords } from '../../../_utils/global-methods';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-create-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, NgClass, SelectModule, InputNumber, TranslateModule],
  templateUrl: './product-create-dialog.html',
  styleUrl: './product-create-dialog.scss',
})
export class ProductCreateDialog implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly translateService = inject(TranslateService);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  showLoader = false;

  isErrorItemName = false;
  visible: boolean = false;

  categoryOptions: { label: string, value: string }[] =
  [ { label: '', value: '' } ];

  // image_url
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  imageUrl: string | ArrayBuffer | null = null;
  checkImageUrl : boolean = false;
  private _itemName = signal('');
  public initialLetter = computed(() =>
    this._itemName().trim() ? this._itemName().trim()[0].toUpperCase() : ''
  );
  noPhoto : string = 'Product Image'
  private selectedFile: File | null = null;
  isUploading = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('productFormRef') formElement!: ElementRef<HTMLFormElement>;

  ngOnInit(): void {
    this.initializeForm();
    this.imageUrl;

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'product-create')
          {
            this.visible = value.isVisible;

            this.translateions();
            this.subs.add(
              this.translateService.onLangChange.subscribe(() => {
                this.translateions();
              })
            );
          }
      })
    );

    this.subs.add(
      this.form.get('itemName')?.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(value => {
        this._itemName.set(value || '');
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    this.dialogCreateRep.clear();
  }

  private initializeForm()
  {
    this.form = this.fb.group({
      itemName: ['', Validators.required],
      price: [],
      category: ['']
    });

    this.form.get('itemName')?.valueChanges.subscribe(() => {
      this.form.get('itemName')?.setErrors(null);
      this.isErrorItemName = false;
    });
  }

  private resetFormErrors() {
    this.form.get('itemName')?.setErrors(null);
    this.form.get('itemName')?.updateValueAndValidity();

    this.isErrorItemName = false;
  }

  private translateions(): void
  {
    this.categoryOptions = [
      { label: 'Hambúrgueres', value: 'hamburgueres' },
      { label: 'Sandes', value: 'sandes' },
      { label: 'Frango Grelhado', value: 'frango_grelhado' },
      { label: 'Batatas & Acompanhamentos', value: 'acompanhamentos' },
      { label: 'Pizzas', value: 'pizzas' },
      { label: 'Snacks', value: 'snacks' },
      { label: 'Pratos Combinados', value: 'pratos_combinados' },
      { label: 'Bebidas', value: 'bebidas' },
      { label: 'Refrigerantes', value: 'refrigerantes' },
      { label: 'Sumos Naturais', value: 'sumos_naturais' },
      { label: 'Milkshakes', value: 'milkshakes' },
      { label: 'Sobremesas', value: 'sobremesas' },
      { label: 'Menu Infantil', value: 'menu_infantil' },
      { label: 'Combos', value: 'combos' },
      { label: 'Outros', value: 'outros' }
    ];
  }

  onSubmit(): void
  {
    this.showLoader = true;
    this.resetFormErrors();

    if (this.form.value.itemName === '')
    {
      this.showLoader = false;
      this.form.get('itemName')?.setErrors({ invalid: true });
      this.isErrorItemName = true;

      return;
    }

    if (this.form.valid)
    {
      const payload: ProductsCreateDTO =
      {
        itemName: capitalizeWords(this.form.value.itemName),
        imageUrl: this.selectedFile,
        price: this.form.value.price,
        category: this.form.value.category
      };

      const formData = new FormData();
      formData.append('itemName', payload.itemName);
      formData.append('imageUrl', payload.imageUrl ?? '');
      formData.append('price', payload.price.toString());
      formData.append('category', payload.category);

      this.subs.add(
        this.productService.create(formData).pipe(
          take(1)
        ).subscribe({
          next: (resp) => {
            Object.keys(this.form.controls).forEach(key => {
              this.form.get(key)?.setErrors(null);
            });

            this.visible = false;
            this.showLoader = false;
            this.dialogCreateRep.clear();
            this.resetForm();
            this.initializeForm();

            this.toastRep.onShowMsg('success', resp.message);
          },
          error: (err: any) => {
            this.showLoader = false;

            let errorMessage = 'ERRORS.UNEXPECTED_ERROR';
            let fieldErrors: any = {};

            // Most common cases (covers 95% of backends)
            if (err.error) {
              // Case 1: Simple string message
              if (typeof err.error === 'string') {
                errorMessage = err.error;
              }
              // Case 2: { message: "..." }
              else if (err.error.message) {
                errorMessage = err.error.message;
              }
              // Case 3: Validation errors (Spring Boot, NestJS, etc.)
              else if (err.error.errors || err.error.detail) {
                const errors = err.error.errors || err.error.detail;

                if (Array.isArray(errors)) {
                  // Array of strings: ["itemName is required", "price must be positive"]
                  errorMessage = errors.join(', ');
                }
                else if (typeof errors === 'object') {
                  // Object with field names: { itemName: ["cannot be empty"], price: ["too low"] }
                  fieldErrors = errors;
                  errorMessage = 'ERRORS.REQUIRED_FIELDS';

                  // Auto-mark invalid fields in the form
                  Object.keys(fieldErrors).forEach(field => {
                    const control = this.form.get(field);
                    if (control) {
                      control.setErrors({ serverError: fieldErrors[field].join(', ') });
                      control.markAsTouched();
                    }
                  });
                }
              }
            }

            // Fallback: use status text
            if (!errorMessage || errorMessage === 'An unexpected error occurred') {
              errorMessage = err.message || err.statusText || 'ERRORS.REQUEST_FAILED';
            }

            // Show toast
            this.toastRep.onShowMsg('error', errorMessage);

            // Optional: highlight specific field (like itemName)
            this.form.get('itemName')?.setErrors({ invalid: true });
            this.isErrorItemName = true;
          }
        })
      );
    }
  }

  // image_url
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.length) return;

    const file = input.files[0];
    this.selectedFile = file;

    if (!file.type.startsWith('image/')) {
      this.toastRep.onShowMsg('error', 'ERRORS.SELECT_VALID_IMAGE');
      input.value = '';
      return;
    }

    this.isUploading = true;
    this.checkImageUrl = false;
    this.imageUrl = null;

    const reader = new FileReader();

    reader.onload = () => {
      // Força o Angular a detectar as mudanças AGORA
      this.ngZone.run(() => {
        this.imageUrl = reader.result as string;
        this.checkImageUrl = true;
        this.isUploading = false;
        this.cdr.detectChanges(); // opcional, mas ajuda em casos extremos
      });
    };

    reader.onerror = () => {
      this.ngZone.run(() => {
        this.toastRep.onShowMsg('error', 'ERRORS.IMAGE_READ_ERROR');
        this.isUploading = false;
      });
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  deleteImage()
  {
    // Verifica se há uma imagem carregada
    if (!this.imageUrl) {
      return;
    }
    this.fileInput.nativeElement.value = ''; // Limpa o caminho do arquivo
    this.isUploading = false;
    this.selectedFile = null;
    this.imageUrl = null;
    this.checkImageUrl = false;
  }

  private resetForm() {
    if (this.imageUrl) {
      this.fileInput.nativeElement.value = ''; // Limpa o caminho do arquivo
      this.isUploading = false;
      this.selectedFile = null;
      this.imageUrl = null;
      this.checkImageUrl = false;
    }

    this.form.reset();
    this.formElement.nativeElement.reset();
  }
}
