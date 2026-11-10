import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Agregamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  featuredProducts: any[] = [];
  isLoading = true;

  private apiUrl = environment.apiUrl;

  // Inyectamos ChangeDetectorRef para evitar el bug del SSR
  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.isLoading = true;
    
    // Solo pedimos los productos
    this.http.get<any[]>(`${this.apiUrl}/product`).subscribe({
      next: (res) => {
        // 1. Filtramos los que marcaste como "isFeatured" en el admin
        const featured = res.filter(p => p.isFeatured === true);
        
        // 2. Si tienes menos de 4, mostramos los primeros que haya para no dejar el home vacío
        this.featuredProducts = featured.length > 0 ? featured.slice(0, 4) : res.slice(0, 4);
        
        this.isLoading = false;
        
        // 3. Forzamos actualización de la vista
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}