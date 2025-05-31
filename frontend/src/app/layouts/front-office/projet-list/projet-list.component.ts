import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjetService } from '../../../core/services/projet.service';
import { Projet, StatutProjet } from '../../../core/models/projet.model';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.scss']
})
export class ProjetListComponent implements OnInit, OnDestroy, AfterViewInit {
  projets: Projet[] = [];
  chargement = false;
  erreur = '';
  private subscription?: Subscription;
  searchTerm = '';
  selectedStatus = '';
  statuts = Object.values(StatutProjet);
  displayedColumns: string[] = ['titre', 'description', 'statut', 'dateDebut', 'dateFin', 'actions'];
  dataSource = new MatTableDataSource<Projet>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  get projetsFiltres() {
    const filtered = this.projets
      .filter(p => !this.searchTerm || p.titre.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(p => !this.selectedStatus || p.statut === this.selectedStatus);
    this.dataSource.data = filtered;
    return filtered;
  }

  constructor(
    private projetService: ProjetService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.chargerProjets();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  chargerProjets() {
    this.chargement = true;
    this.subscription = this.projetService.getProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.dataSource.data = projets;
        this.chargement = false;
      },
      error: (err) => {
        this.erreur = "Erreur lors du chargement des projets.";
        this.chargement = false;
        console.error('Erreur:', err);
      }
    });
  }

  voirDetails(id: string) {
    this.router.navigate(['/projets', id]);
    this.snackBar.open('Consultation du projet ' + id, 'Fermer', { duration: 2000 });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
