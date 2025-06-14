import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | Date, format: string = 'medium'): string {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'medium':
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      case 'long':
        return date.toLocaleDateString(undefined, options);
      case 'time':
        return date.toLocaleTimeString();
      default:
        return date.toLocaleDateString(undefined, options);
    }
  }
} 