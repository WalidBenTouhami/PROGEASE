import { Injectable } from '@angular/core';
import { MonitoringService } from './monitoring.service';

interface PerformanceEntryWithProcessing extends PerformanceEntry {
  processingStart?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metrics: Map<string, number[]> = new Map();
  private readonly MAX_METRICS = 100;

  constructor(private monitoringService: MonitoringService) {
    this.initializePerformanceObserver();
  }

  private initializePerformanceObserver(): void {
    if (window.PerformanceObserver) {
      // Observe Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as PerformanceEntryWithProcessing;
          if (fidEntry.processingStart) {
            this.trackMetric('fid', fidEntry.processingStart - fidEntry.startTime);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const layoutShiftEntry = entry as LayoutShiftEntry;
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
            clsValue += layoutShiftEntry.value;
          }
        });
        this.trackMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  public trackMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name);
    if (values) {
      values.push(value);

      // Keep only the last MAX_METRICS values
      if (values.length > this.MAX_METRICS) {
        values.shift();
      }

      // Calculate and report statistics
      const stats = this.calculateStats(values);
      this.monitoringService.trackPerformanceMetric(name, stats.average);

      // Report to monitoring service if value exceeds threshold
      if (this.shouldReportMetric(name, value)) {
        this.monitoringService.captureMessage(
          `Performance metric ${name} exceeded threshold`,
          'warning',
          { value, threshold: this.getThreshold(name), stats }
        );
      }
    }
  }

  private calculateStats(values: number[]): { min: number; max: number; average: number; p95: number } {
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95 = sorted[p95Index];

    return { min, max, average, p95 };
  }

  private shouldReportMetric(name: string, value: number): boolean {
    const threshold = this.getThreshold(name);
    return value > threshold;
  }

  private getThreshold(name: string): number {
    const thresholds: { [key: string]: number } = {
      lcp: 2500, // 2.5 seconds
      fid: 100,  // 100 milliseconds
      cls: 0.1,  // 0.1 score
      ttfb: 800, // 800 milliseconds
      fcp: 1800  // 1.8 seconds
    };
    return thresholds[name] || 1000;
  }

  public getMetrics(): Map<string, number[]> {
    return this.metrics;
  }

  public getMetricStats(name: string): { min: number; max: number; average: number; p95: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }
    return this.calculateStats(values);
  }
} 