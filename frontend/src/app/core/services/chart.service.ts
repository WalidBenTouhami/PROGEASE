import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { registerables } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  constructor() {
    Chart.register(...registerables);
  }

  createLineChart(
    canvas: HTMLCanvasElement,
    data: number[],
    labels: string[],
    label: string,
    color: string = '#007bff'
  ): Chart {
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor: color,
          backgroundColor: this.hexToRGBA(color, 0.1),
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    return new Chart(canvas, config);
  }

  createBarChart(
    canvas: HTMLCanvasElement,
    data: number[],
    labels: string[],
    label: string,
    color: string = '#28a745'
  ): Chart {
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: this.hexToRGBA(color, 0.7),
          borderColor: color,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    return new Chart(canvas, config);
  }

  createPieChart(
    canvas: HTMLCanvasElement,
    data: number[],
    labels: string[],
    colors: string[] = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8']
  ): Chart {
    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          }
        }
      }
    };

    return new Chart(canvas, config);
  }

  createDoughnutChart(
    canvas: HTMLCanvasElement,
    data: number[],
    labels: string[],
    colors: string[] = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8']
  ): Chart {
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          }
        }
      }
    };

    return new Chart(canvas, config);
  }

  private hexToRGBA(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
} 