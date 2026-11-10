import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../../../services/supabase';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html'
})
export class AdminProductsComponent implements OnInit {
  productForm: FormGroup;
  categories: any[] = [];
  products: any[] = [];
  
  showForm = false;
  isEditing = false;
  currentProductId: string | null = null;
  
  isLoading = false;
  isLoadingList = true;
  previewUrl: string | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      isFeatured: [false],
      isOnSale: [false],
      variants: this.fb.array([]),
      images: [[]]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.http.get<any[]>(`${this.apiUrl}/category`).subscribe(res => {
      this.categories = res;
      this.cdr.detectChanges();
    });
  }

  loadProducts() {
    this.isLoadingList = true;
    this.http.get<any[]>(`${this.apiUrl}/product`).subscribe({
      next: (res) => {
        this.products = res;
        this.isLoadingList = false;
        this.cdr.detectChanges();
      },
      error: () => this.isLoadingList = false
    });
  }

  // --- Lógica para abrir el formulario ---
  openForm() {
    this.showForm = true;
    this.isEditing = false;
    this.currentProductId = null;
    this.productForm.reset({ isFeatured: false, isOnSale: false });
    this.variants.clear();
    this.addVariant();
    this.previewUrl = null;
  }

    editProduct(prod: any) {
    this.showForm = true;
    this.isEditing = true;
    this.currentProductId = prod.id;
    this.previewUrl = prod.images[0]?.url || null;

    this.productForm.patchValue({
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: prod.price,
      categoryId: prod.categoryId,
      isFeatured: prod.isFeatured,
      isOnSale: prod.isOnSale,
      images: prod.images || []
    });

    this.variants.clear();
    if (prod.variants && prod.variants.length > 0) {
      prod.variants.forEach((v: any) => {
        this.variants.push(this.fb.group({
          id: [v.id], // <-- Importante para que el backend sepa que es una variante existente
          name: [v.name, Validators.required],
          sku: [v.sku || ''],
          price: [v.price || null],
          stock: [v.stock, [Validators.required, Validators.min(0)]]
        }));
      });
    } else {
      this.addVariant();
    }
  }

  closeForm() {
    this.showForm = false;
  }

  deleteProduct(id: string) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.http.delete(`${this.apiUrl}/product/${id}`).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  // --- Lógica de Imagen ---
  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.previewUrl = URL.createObjectURL(file);

    try {
      const publicUrl = await this.supabaseService.uploadImage(file);
      this.productForm.patchValue({
        images: [{ url: publicUrl, isMain: true }]
      });
    } catch (error) {
      alert('Error subiendo imagen');
      this.previewUrl = null;
    }
  }

  // --- Lógica de Variantes ---
  get variants() {
    return this.productForm.get('variants') as FormArray;
  }

  addVariant() {
    const variantForm = this.fb.group({
      id: [null], // <-- Guardamos el ID por si estamos editando
      name: ['', Validators.required],
      sku: [''], 
      price: [null],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
    this.variants.push(variantForm);
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  // --- Guardar (Crear o Editar) ---
  onSubmit() {
    if (this.productForm.invalid) return;
    this.isLoading = true;

    // Forzamos a que el precio sea un número real
    const payload = {
      ...this.productForm.value,
      price: Number(this.productForm.value.price),
      categoryId: Number(this.productForm.value.categoryId),
      images: this.productForm.value.images.map((img: any) => ({
        url: img.url,
        isMain: img.isMain,
        altText: img.altText
      })),
      variants: this.productForm.value.variants.map((v: any) => ({
        id: v.id || undefined, // Si es nueva, no enviamos ID
        name: v.name,
        sku: v.sku || null,    // Si está vacío, enviamos null
        price: v.price ? Number(v.price) : null, // Si está vacío, enviamos null
        stock: Number(v.stock)
      }))
    };

    if (this.isEditing && this.currentProductId) {
      this.http.patch(`${this.apiUrl}/product/${this.currentProductId}`, payload).subscribe({
        next: () => {
          alert('Producto actualizado');
          this.isLoading = false;
          this.showForm = false;
          this.loadProducts();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar: ' + (err.error.message || 'Revisa los datos'));
          this.isLoading = false;
        }
      });
    } else {
      this.http.post(`${this.apiUrl}/product`, payload).subscribe({
        next: () => {
          alert('Producto creado');
          this.isLoading = false;
          this.showForm = false;
          this.loadProducts();
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear: ' + (err.error.message || 'Revisa los datos'));
          this.isLoading = false;
        }
      });
    }
  }
}