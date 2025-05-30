import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjetService } from '../../core/services/projet.service';
import { Projet, StatutProjet } from '../../core/models/projet.model';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.css']
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
    this.subscription = this.projetService.recupererProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.chargement = false;
        this.dataSource.data = projets;
      },
      error: (err) => {
        this.erreur = "Erreur lors du chargement des projets.";
        this.chargement = false;
        console.error('Erreur:', err);
      }
    });
  }

  voirDetails(id: string) {
    this.router.navigate(['/projet', id]);
    this.snackBar.open('Consultation du projet ' + id, 'Fermer', { duration: 2000 });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
