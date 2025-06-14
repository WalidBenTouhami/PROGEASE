import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDebounceClick]',
  standalone: true
})
export class DebounceClickDirective {
  @Input() debounceTime = 500;
  @Output() debounceClick = new EventEmitter();

  private lastClickTime = 0;

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastClickTime;

    if (timeDiff > this.debounceTime) {
      this.lastClickTime = currentTime;
      this.debounceClick.emit(event);
    }
  }
} 