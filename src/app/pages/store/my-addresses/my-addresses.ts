import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address } from '../../../services/address';

@Component({
  selector: 'app-my-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-addresses.html'
})
export class MyAddresses implements OnInit {
  addressService = inject(Address);
  private fb = inject(FormBuilder);

  addressForm: FormGroup;
  showForm = false;
  isEditing = false;
  currentId: string | null = null;

  constructor() {
    this.addressForm = this.fb.group({
      alias: [''],
      recipientName: ['', Validators.required],
      phone: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      reference: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.addressService.loadAddresses();
  }

  openForm() {
    this.showForm = true;
    this.isEditing = false;
    this.currentId = null;
    this.addressForm.reset({ isDefault: false });
  }

  editAddress(addr: any) {
    this.showForm = true;
    this.isEditing = true;
    this.currentId = addr.id;
    this.addressForm.patchValue(addr);
  }

  onSubmit() {
    if (this.addressForm.invalid) return;

    if (this.isEditing && this.currentId) {
      this.addressService.updateAddress(this.currentId, this.addressForm.value).subscribe(() => {
        this.showForm = false;
        this.addressService.loadAddresses();
      });
    } else {
      this.addressService.createAddress(this.addressForm.value).subscribe(() => {
        this.showForm = false;
        this.addressService.loadAddresses();
      });
    }
  }

  deleteAddress(id: string) {

    if (confirm('¿Eliminar esta dirección?')) {
        this.addressService.deleteAddress(id).subscribe(() => {
        this.addressService.loadAddresses();
      });
    }
  }
}