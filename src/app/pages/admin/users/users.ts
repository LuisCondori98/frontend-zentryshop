import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  isLoading = true;

  isEditModalOpen = false;
  editingUser: any = {}; // Aquí guardamos el usuario que se está editando
  isSaving = false;

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = environment.apiUrl;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/user`).subscribe({
      next: (res) => {
        this.users = res;
        this.filteredUsers = res;
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = this.users;
      return;
    }
    this.filteredUsers = this.users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const document = (user.documentNumber || '').toString();
      return fullName.includes(term) || document.includes(term);
    });
  }

  // 👇 NUEVA LÓGICA PARA ELIMINAR 👇
  deleteUser(id: string) {
    if (confirm('¿Estás seguro de eliminar a este usuario? Esta acción no se puede deshacer.')) {
      this.http.delete(`${this.apiUrl}/user/${id}`).subscribe({
        next: () => {
          // Recargamos la lista después de borrar
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error eliminando usuario', err);
          alert('No se pudo eliminar el usuario. Puede que tenga órdenes asociadas.');
        }
      });
    }
  }

  openEditModal(user: any) {
    // Copiamos el usuario para no modificar la tarjeta original hasta que se guarde
    this.editingUser = { ...user }; 
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingUser = {};
  }

  saveUserChanges() {
    if (!this.editingUser.id) return;
    
    this.isSaving = true;

    // Hacemos el PATCH a NestJS enviando los datos actualizados
    this.http.patch(`${this.apiUrl}/user/${this.editingUser.id}`, this.editingUser).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeEditModal();
        this.loadUsers(); // Recargamos la lista para ver los cambios
      },
      error: (err) => {
        console.error('Error actualizando usuario', err);
        alert('Error al guardar: ' + (err.error.message || 'Intenta de nuevo'));
        this.isSaving = false;
      }
    });
  }
}