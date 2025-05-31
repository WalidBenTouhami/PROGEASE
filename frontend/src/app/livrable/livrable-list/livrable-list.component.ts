import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Livrable, StatutLivrable } from '../../core/models/livrable.model';
import { LivrableService } from '../../core/services/livrable.service';

@Component({
  selector: 'app-livrable-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './livrable-list.component.html',
  styleUrls: ['./livrable-list.component.css']
})
export class LivrableListComponent implements OnInit, OnDestroy {
  @Input() projetId!: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  chargement = true;
  erreur = '';
  livrables: Livrable[] = [];
  dataSource = new MatTableDataSource<Livrable>();
  private subscription?: Subscription;
  StatutLivrable = StatutLivrable;

  constructor(
    private livrableService: LivrableService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerLivrables();
  }

  chargerLivrables(): void {
    if (this.projetId) {
      this.subscription = this.livrableService.recupererLivrablesParProjet(this.projetId).subscribe({
        next: (livrables) => {
          this.livrables = livrables;
          this.dataSource.data = this.livrables;
          this.chargement = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des livrables:', error);
          this.erreur = 'Une erreur est survenue lors du chargement des livrables.';
          this.chargement = false;
        }
      });
    }
  }

  voirDetails(id: string): void {
    this.router.navigate(['/livrable', id]);
  }

  isEnAttente(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.EN_ATTENTE;
  }

  isEnRetard(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.EN_RETARD;
  }

  isTermine(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.TERMINE;
  }

  isStatus(statut: StatutLivrable, status: StatutLivrable): boolean {
    return statut === status;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
