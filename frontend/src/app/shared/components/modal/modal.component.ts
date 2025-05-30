import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 overflow-y-auto z-50" 
         aria-labelledby="modal-title" 
         role="dialog" 
         aria-modal="true">
      <!-- Background backdrop -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-blur-sm transition-opacity"
           (click)="close.emit()"></div>

      <!-- Modal panel -->
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full"
               [class]="size === 'large' ? 'sm:max-w-4xl' : 'sm:max-w-lg'"
               (click)="$event.stopPropagation()">
            <!-- Modal header -->
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                  {{title}}
                </h3>
                <button type="button" 
                        class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        (click)="close.emit()">
                  <span class="sr-only">Fermer</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal content -->
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
      overflow-y: auto;
    }
  `]
})
export class ModalComponent {
  @Input() title = '';
  @Input() size: 'default' | 'large' = 'default';
  @Output() close = new EventEmitter<void>();
} 