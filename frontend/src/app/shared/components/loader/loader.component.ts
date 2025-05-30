import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-[400px] flex flex-col items-center justify-center">
      <div class="relative">
        <!-- Outer circle -->
        <div class="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
        <!-- Inner spinning circle -->
        <div class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p class="mt-4 text-gray-600 text-lg">Chargement...</p>
    </div>
  `,
  styles: [`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {} 