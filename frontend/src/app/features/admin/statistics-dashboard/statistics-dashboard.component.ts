import { Component, OnInit } from '@angular/core';
import { AdminService, Statistiques } from '../../../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-statistics-dashboard',
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.scss']
})
export class StatisticsDashboardComponent implements OnInit {
  statistiques: Statistiques | null = null;
  loading = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerStatistiques();
  }

  chargerStatistiques(): void {
    this.loading = true;
    this.adminService.getStatistiques().subscribe({
      next: (stats) => {
        this.statistiques = stats;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement des statistiques', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculerPourcentage(valeur: number, total: number): number {
    return total > 0 ? (valeur / total) * 100 : 0;
  }
} 