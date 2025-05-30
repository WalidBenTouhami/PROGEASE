import { Component, OnInit, ViewChild } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { FormsModule } from '@angular/forms';
    import { ChartConfiguration, ChartType } from 'chart.js';
    import { NgChartsModule, BaseChartDirective } from 'ng2-charts';

    @Component({
      selector: 'app-backoffice-dashboard',
      standalone: true,
      imports: [CommonModule, FormsModule, NgChartsModule],
      templateUrl: './dashboard.component.html',
      styleUrls: ['./dashboard.component.css']
    })
    export class BackOfficeDashboardComponent implements OnInit {
      @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

      roles = ['Administrateur', 'Tuteur', 'etudiant'];
      stats = { projetsActifs: 5, groupesRisque: 2, performanceMoyTuteur: 8.5 };

      projetsAValider: number = 0;
      livrablesACorriger: number = 0;
      nbEtudiants = 0;
      dernieresActions: Array<{ date: string; description: string }> = [];

      barChartData: ChartConfiguration<'bar'>['data'] = {
        labels: ['Projets à valider', 'Livrables à corriger', 'Étudiants inscrits'],
        datasets: [
          { data: [0, 0, 0], label: 'Statistiques', backgroundColor: ['#ff9800', '#e53935', '#43a047'] }
        ]
      };

      barChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        plugins: { legend: { display: false } }
      };

      barChartType: ChartType = 'bar';

      ngOnInit() {
        // Initialize dashboard data
        this.projetsAValider = 5;
        this.livrablesACorriger = 10;
        this.dernieresActions = [
          { date: '2024-03-20', description: 'Nouveau projet soumis' },
          { date: '2024-03-19', description: 'Livrable corrige' }
        ];
        this.barChartData.datasets[0].data = [this.projetsAValider, this.livrablesACorriger, this.nbEtudiants];
      }
    }
