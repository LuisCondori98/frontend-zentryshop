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
  
  // 👇 Cambiamos a un arreglo para múltiples imágenes
  previewUrls: string[] = [];
  isUploadingImage = false;

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
      images: [[]] // Array de imágenes
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
    this.productForm.reset({ isFeatured: false, isOnSale: false, images: [] });
    this.variants.clear();
    this.addVariant();
    this.previewUrls = []; // Limpiamos la previsualización
  }

  editProduct(prod: any) {
    this.showForm = true;
    this.isEditing = true;
    this.currentProductId = prod.id;
    
    // Llenamos las previsualizaciones con las imágenes que ya tiene el producto
    this.previewUrls = prod.images ? prod.images.map((img: any) => img.url) : [];

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
          id: [v.id],
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

  // --- Lógica de MÚLTIPLES Imágenes ---
  async onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploadingImage = true;

    try {
      const uploadPromises = [];
      const urlsToPreview: string[] = [];

      // Preparamos la subida y la previsualización rápida de todos los archivos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        urlsToPreview.push(URL.createObjectURL(file));
        uploadPromises.push(this.supabaseService.uploadImage(file));
      }

      // Agregamos las nuevas previsualizaciones a las que ya teníamos
      this.previewUrls = [...this.previewUrls, ...urlsToPreview];
      this.cdr.detectChanges();

      // Subimos todas a Supabase en paralelo
      const uploadedUrls = await Promise.all(uploadPromises);

      // Preparamos el array de imágenes para el formulario
      const currentImages = this.productForm.value.images || [];
      const newImages = uploadedUrls.map((url, index) => ({
        url: url,
        isMain: currentImages.length === 0 && index === 0 // La primera será la principal
      }));

      // Actualizamos el formulario con todas las imágenes
      this.productForm.patchValue({
        images: [...currentImages, ...newImages]
      });

    } catch (error) {
      alert('Error subiendo una o más imágenes a Supabase');
      console.error(error);
      this.previewUrls = this.productForm.value.images.map((img: any) => img.url); // Revertimos
    } finally {
      this.isUploadingImage = false;
      this.cdr.detectChanges();
    }
  }

  // Función para eliminar una imagen de la galería
  removeImage(index: number) {
    // Quitamos la imagen visual
    this.previewUrls.splice(index, 1);
    
    // Quitamos la imagen del formulario
    const currentImages = this.productForm.value.images;
    currentImages.splice(index, 1);
    this.productForm.patchValue({ images: currentImages });
  }

  // --- Lógica de Variantes ---
  get variants() {
    return this.productForm.get('variants') as FormArray;
  }

  addVariant() {
    const variantForm = this.fb.group({
      id: [null],
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
    if (this.productForm.invalid || this.isUploadingImage) return;
    this.isLoading = true;

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
        id: v.id || undefined,
        name: v.name,
        sku: v.sku || null,
        price: v.price ? Number(v.price) : null,
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