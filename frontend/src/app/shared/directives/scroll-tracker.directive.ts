import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appScrollTracker]',
  standalone: true
})
export class ScrollTrackerDirective {
  @Input() threshold = 0.8;
  @Output() scrolled = new EventEmitter<void>();

  private observer: IntersectionObserver;

  constructor(private elementRef: ElementRef) {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.scrolled.emit();
        }
      },
      {
        threshold: this.threshold
      }
    );
  }

  ngAfterViewInit(): void {
    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
} 