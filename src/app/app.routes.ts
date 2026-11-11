import { Routes } from '@angular/router';

// Componentes de Autenticación
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';

// Vistas Públicas
import { Home } from './pages/store/home/home';
import { Catalog } from './pages/store/catalog/catalog';
import { ProductDetail } from './pages/store/product-detail/product-detail';

// Vistas de Admin
import { AdminProductsComponent } from './pages/admin/products/products';
import { AdminUsersComponent } from './pages/admin/users/users';
//import { AdminCategoriesComponent } from './pages/admin/categories/categories'; // Si la tienes

// Layouts
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';

// Guards
import { guestGuard } from './guards/guest-guard';
import { roleGuard } from './guards/role-guard';
import { CartComponent } from './pages/store/cart/cart';
import { AdminCategoriesComponent } from './pages/admin/categories/categories';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { MyAddresses } from './pages/store/my-addresses/my-addresses';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: PublicLayoutComponent, 
    children: [
      { path: '', redirectTo: 'tienda', pathMatch: 'full' },
      { path: 'tienda', component: Home },
      { path: 'productos', component: Catalog },
      { path: 'categoria/:slug', component: Catalog },
      { path: 'product/:slug', component: ProductDetail },
      { path: 'carrito', component: CartComponent },
      { path: 'mis-direcciones', component: MyAddresses },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { path: 'productos', component: AdminProductsComponent },
      { path: 'usuarios', component: AdminUsersComponent },
      { path: 'categorias', component: AdminCategoriesComponent },
      //{ path: 'categorias', component: AdminCategoriesComponent }, 
    ]
  },
  { 
    path: '**',
    redirectTo: 'tienda'
  }
];