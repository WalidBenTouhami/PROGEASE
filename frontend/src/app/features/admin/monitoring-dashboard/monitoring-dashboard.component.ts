import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MonitoringService } from '../../../core/services/monitoring.service';
import { PerformanceService } from '../../../core/services/performance.service';
import { ErrorTrackingService } from '../../../core/services/error-tracking.service';
import { UserBehaviorService } from '../../../core/services/user-behavior.service';
import { ChartService } from '../../../core/services/chart.service';
import { interval, Subscription } from 'rxjs';
import { ErrorDetailsModalComponent } from '../error-details-modal/error-details-modal.component';
import { Chart } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-monitoring-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="dashboard-container">
      <h1>Tableau de bord de surveillance</h1>

      <!-- Performance Metrics -->
      <section class="dashboard-section">
        <h2>Métriques de performance</h2>
        <div class="metrics-grid">
          <div class="metric-card" *ngFor="let metric of performanceMetrics | keyvalue">
            <h3>{{ metric.key }}</h3>
            <div class="metric-value">{{ metric.value | number:'1.0-2' }}ms</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas #performanceChart></canvas>
        </div>
      </section>

      <!-- Error Analytics -->
      <section class="dashboard-section">
        <h2>Analytique des erreurs</h2>
        <div class="error-stats">
          <div class="error-card" *ngFor="let stat of errorStats | keyvalue">
            <h3>{{ stat.key }}</h3>
            <div class="error-count">{{ stat.value }}</div>
          </div>
        </div>
        <div class="charts-grid">
          <div class="chart-container">
            <canvas #errorDistributionChart></canvas>
          </div>
          <div class="chart-container">
            <canvas #errorTrendChart></canvas>
          </div>
        </div>
        <div class="error-list">
          <h3>Dernières erreurs</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Message</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let error of recentErrors">
                <td>{{ error.type }}</td>
                <td>{{ error.message }}</td>
                <td>{{ error.timestamp | date:'medium' }}</td>
                <td>
                  <button mat-button (click)="showErrorDetails(error)">Détails</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- User Behavior -->
      <section class="dashboard-section">
        <h2>Comportement utilisateur</h2>
        <div class="charts-grid">
          <div class="chart-container">
            <canvas #userInteractionsChart></canvas>
          </div>
          <div class="chart-container">
            <canvas #pageViewsChart></canvas>
          </div>
        </div>
        <div class="user-stats">
          <div class="stat-card">
            <h3>Interactions</h3>
            <div class="stat-value">{{ interactionStats | json }}</div>
          </div>
          <div class="stat-card">
            <h3>Durée de session</h3>
            <div class="stat-value">{{ sessionDuration | date:'mm:ss' }}</div>
          </div>
        </div>
      </section>

      <!-- Alerts -->
      <section class="dashboard-section">
        <h2>Alertes</h2>
        <div class="charts-grid">
          <div class="chart-container">
            <canvas #alertDistributionChart></canvas>
          </div>
        </div>
        <div class="alerts-list">
          <div class="alert-card" *ngFor="let alert of alerts" [class]="alert.severity">
            <h3>{{ alert.title }}</h3>
            <p>{{ alert.message }}</p>
            <span class="alert-time">{{ alert.timestamp | date:'medium' }}</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-section {
      margin-bottom: 30px;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .metric-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }

    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
      background: #f8f9fa;
      border-radius: 6px;
      padding: 15px;
    }

    .error-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .error-card {
      background: #fff;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      border: 1px solid #dee2e6;
    }

    .error-count {
      font-size: 20px;
      font-weight: bold;
      color: #dc3545;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    th {
      background-color: #f8f9fa;
    }

    .alert-card {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 6px;
      border-left: 4px solid;
    }

    .alert-card.critical {
      background-color: #fff5f5;
      border-left-color: #dc3545;
    }

    .alert-card.warning {
      background-color: #fff3cd;
      border-left-color: #ffc107;
    }

    .alert-card.info {
      background-color: #e3f2fd;
      border-left-color: #0dcaf0;
    }

    .alert-time {
      font-size: 12px;
      color: #6c757d;
    }

    button {
      padding: 6px 12px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class MonitoringDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('performanceChart') performanceChartRef!: ElementRef;
  @ViewChild('errorDistributionChart') errorDistributionChartRef!: ElementRef;
  @ViewChild('errorTrendChart') errorTrendChartRef!: ElementRef;
  @ViewChild('userInteractionsChart') userInteractionsChartRef!: ElementRef;
  @ViewChild('pageViewsChart') pageViewsChartRef!: ElementRef;
  @ViewChild('alertDistributionChart') alertDistributionChartRef!: ElementRef;

  performanceMetrics: { [key: string]: number } = {};
  errorStats: { [key: string]: number } = {};
  recentErrors: any[] = [];
  interactionStats: { [key: string]: number } = {};
  sessionDuration: number = 0;
  alerts: any[] = [];
  private updateSubscription!: Subscription;
  private charts: { [key: string]: Chart } = {};

  constructor(
    private monitoringService: MonitoringService,
    private performanceService: PerformanceService,
    private errorTrackingService: ErrorTrackingService,
    private userBehaviorService: UserBehaviorService,
    private chartService: ChartService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.updateSubscription = interval(5000).subscribe(() => {
      this.updateDashboard();
    });
    this.updateDashboard();
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    Object.values(this.charts).forEach(chart => chart.destroy());
  }

  private initializeCharts(): void {
    // Performance Chart
    this.charts['performance'] = this.chartService.createLineChart(
      this.performanceChartRef.nativeElement,
      [],
      [],
      'Performance Metrics'
    );

    // Error Distribution Chart
    this.charts['errorDistribution'] = this.chartService.createPieChart(
      this.errorDistributionChartRef.nativeElement,
      [],
      []
    );

    // Error Trend Chart
    this.charts['errorTrend'] = this.chartService.createLineChart(
      this.errorTrendChartRef.nativeElement,
      [],
      [],
      'Error Trend',
      '#dc3545'
    );

    // User Interactions Chart
    this.charts['userInteractions'] = this.chartService.createBarChart(
      this.userInteractionsChartRef.nativeElement,
      [],
      [],
      'User Interactions'
    );

    // Page Views Chart
    this.charts['pageViews'] = this.chartService.createDoughnutChart(
      this.pageViewsChartRef.nativeElement,
      [],
      []
    );

    // Alert Distribution Chart
    this.charts['alertDistribution'] = this.chartService.createPieChart(
      this.alertDistributionChartRef.nativeElement,
      [],
      []
    );
  }

  private updateDashboard(): void {
    // Update performance metrics
    const metrics = this.performanceService.getMetrics();
    this.performanceMetrics = Object.fromEntries(
      Array.from(metrics.entries()).map(([key, values]) => [
        key,
        values.reduce((a, b) => a + b, 0) / values.length
      ])
    );

    // Update error statistics
    this.errorStats = this.errorTrackingService.getErrorStats();
    this.recentErrors = this.errorTrackingService.getErrorHistory().slice(0, 10);

    // Update user behavior statistics
    this.interactionStats = this.userBehaviorService.getInteractionStats();
    this.sessionDuration = this.userBehaviorService.getSessionDuration();

    // Update charts
    this.updateCharts();

    // Check for new alerts
    this.checkAlerts();
  }

  private updateCharts(): void {
    // Update Performance Chart
    const performanceData = Object.values(this.performanceMetrics);
    const performanceLabels = Object.keys(this.performanceMetrics);
    this.updateChart('performance', performanceData, performanceLabels);

    // Update Error Distribution Chart
    const errorData = Object.values(this.errorStats);
    const errorLabels = Object.keys(this.errorStats);
    this.updateChart('errorDistribution', errorData, errorLabels);

    // Update Error Trend Chart
    const errorTrendData = this.recentErrors.map(e => 1);
    const errorTrendLabels = this.recentErrors.map(e => 
      new Date(e.timestamp).toLocaleTimeString()
    );
    this.updateChart('errorTrend', errorTrendData, errorTrendLabels);

    // Update User Interactions Chart
    const interactionData = Object.values(this.interactionStats);
    const interactionLabels = Object.keys(this.interactionStats);
    this.updateChart('userInteractions', interactionData, interactionLabels);

    // Update Page Views Chart
    const pageViewsData = [30, 20, 15, 10, 5]; // Example data
    const pageViewsLabels = ['Home', 'Dashboard', 'Profile', 'Settings', 'Other'];
    this.updateChart('pageViews', pageViewsData, pageViewsLabels);

    // Update Alert Distribution Chart
    const alertData = this.alerts.map(a => 1);
    const alertLabels = this.alerts.map(a => a.severity);
    this.updateChart('alertDistribution', alertData, alertLabels);
  }

  private updateChart(chartName: string, data: number[], labels: string[]): void {
    const chart = this.charts[chartName];
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.update();
    }
  }

  private checkAlerts(): void {
    // Check performance metrics
    Object.entries(this.performanceMetrics).forEach(([key, value]) => {
      if (value > 1000) { // Threshold of 1 second
        this.addAlert('warning', `Performance Warning`, 
          `Metric ${key} exceeded threshold: ${value}ms`);
      }
    });

    // Check error rates
    Object.entries(this.errorStats).forEach(([key, value]) => {
      if (value > 5) { // More than 5 errors of any type
        this.addAlert('critical', `Error Rate Alert`, 
          `High number of ${key} errors: ${value}`);
      }
    });
  }

  private addAlert(severity: string, title: string, message: string): void {
    this.alerts.unshift({
      severity,
      title,
      message,
      timestamp: new Date()
    });

    // Keep only last 10 alerts
    if (this.alerts.length > 10) {
      this.alerts.pop();
    }
  }

  showErrorDetails(error: any): void {
    this.dialog.open(ErrorDetailsModalComponent, {
      width: '800px',
      data: {
        ...error,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`
        }
      }
    });
  }
} 