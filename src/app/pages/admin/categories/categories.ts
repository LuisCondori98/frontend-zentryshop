import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class AdminCategoriesComponent implements OnInit {
  categoryForm: FormGroup;
  categories: any[] = [];
  
  isLoading = false;
  isLoadingList = true;
  isEditing = false;
  currentCategoryId: number | null = null;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = environment.apiUrl;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoadingList = true;
    this.http.get<any[]>(`${this.apiUrl}/category`).subscribe({
      next: (res) => {
        this.categories = res;
        this.isLoadingList = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.isLoadingList = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;
    this.isLoading = true;

    const payload = this.categoryForm.value;

    if (this.isEditing && this.currentCategoryId) {
      // EDITAR
      this.http.patch(`${this.apiUrl}/category/${this.currentCategoryId}`, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.resetForm();
          this.loadCategories();
          alert('Categoría actualizada');
        },
        error: (err) => {
          alert('Error: ' + (err.error.message || 'No se pudo actualizar'));
          this.isLoading = false;
        }
      });
    } else {
      // CREAR
      this.http.post(`${this.apiUrl}/category`, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.resetForm();
          this.loadCategories();
          alert('Categoría creada');
        },
        error: (err) => {
          alert('Error: ' + (err.error.message || 'No se pudo crear'));
          this.isLoading = false;
        }
      });
    }
  }

  editCategory(cat: any) {
    this.isEditing = true;
    this.currentCategoryId = cat.id;
    this.categoryForm.patchValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description
    });
  }

  deleteCategory(id: number) {
    if (confirm('¿Estás seguro de eliminar esta categoría? Si tiene productos, podrían quedar sin categoría.')) {
      this.http.delete(`${this.apiUrl}/category/${id}`).subscribe({
        next: () => this.loadCategories(),
        error: (err) => alert('Error al eliminar: ' + (err.error.message || ''))
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentCategoryId = null;
    this.categoryForm.reset();
  }
}