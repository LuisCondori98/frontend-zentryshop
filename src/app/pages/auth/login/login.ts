import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core'; // <-- 1. Agregar
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef // <-- 2. Inyectar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authService.saveToken(response.access_token);
        this.authService.saveUser(response.user);
        this.router.navigate(['/']); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error de conexión';
        this.cdr.detectChanges();
      }
    });
  }
}