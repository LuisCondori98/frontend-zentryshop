import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importante para el buscador
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // <-- Agrega FormsModule
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css']
})
export class Catalog implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: number | null = null;
  searchTerm: string = ''; // <-- Variable del buscador
  isLoading = true;
  isMobileFilterOpen = false;
  onlyOffers: boolean = false;

  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.loadData();
    this.route.queryParams.subscribe(params => {
      const catId = params['categoria'];
      this.selectedCategory = catId ? Number(catId) : null;
      if (this.products.length > 0) {
        this.applyFilter();
      }
    });
  }

  loadData() {
    this.isLoading = true;
    forkJoin({
      categories: this.http.get<any[]>(`${this.apiUrl}/category`),
      products: this.http.get<any[]>(`${this.apiUrl}/product`)
    }).subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.products = res.products;
        this.applyFilter(); 
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 👇 NUEVA LÓGICA DE FILTRADO (Categoría + Buscador) 👇
  applyFilter() {
    let temp = this.products;

    // 1. Filtramos por categoría si hay una seleccionada
    if (this.selectedCategory !== null) {
      temp = temp.filter(p => p.categoryId === this.selectedCategory);
    }

    // 2. Filtramos por ofertas (si el checkbox está marcado)
    if (this.onlyOffers) {
      temp = temp.filter(p => p.isOnSale === true);
    }

    // 3. Filtramos por el buscador
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      temp = temp.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    this.filteredProducts = temp;
  }

  filterByCategory(categoryId: number | null) {
    this.selectedCategory = categoryId;
    
    // Actualizamos la URL
    if (categoryId) {
      this.router.navigate(['/productos'], { queryParams: { categoria: categoryId } });
    } else {
      this.router.navigate(['/productos']);
    }
    
    // Aplicamos el filtro inmediatamente
    this.applyFilter(); 
  }
  
  toggleOffersFilter() {
    this.applyFilter();
  }
}