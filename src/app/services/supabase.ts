import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async uploadImage(file: File): Promise<string> {

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    
    const { data, error } = await this.supabase
      .storage
      .from('Zentry-shop')
      .upload(fileName, file);

    if (error) {

      console.error('Error subiendo imagen:', error);

      throw error;
    }

    // Obtenemos la URL pública
    const { data: urlData } = this.supabase
      .storage
      .from('Zentry-shop')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }
}