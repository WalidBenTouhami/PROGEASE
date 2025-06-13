import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  get(key: string): Observable<any> | null {
    const cachedItem = this.cache.get(key);
    if (!cachedItem) {
      return null;
    }

    const now = new Date().getTime();
    if (now - cachedItem.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return of(cachedItem.data);
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: new Date().getTime()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
} 