import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../../core/services/formation.service';
import { Router, RouterModule } from '@angular/router';
import { Formation } from '../../../core/models/formation.model';

@Component({
  selector: 'app-formation-management',
  templateUrl: './formation-management.component.html',
  standalone: true,
  imports: [CommonModule,RouterModule],
  styleUrls: ['./formation-management.component.css'],
})
export class FormationManagementComponent implements OnInit {
  formations: Formation[] = [];
  paginatedFormations: Formation[] = [];

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;

  constructor(private formationService: FormationService, private _router: Router) {}

ngOnInit(): void {
  this.formationService.getAllFormations().subscribe({
    next: (response: any) => {
      console.log('API response:', response);

      // Adjust based on the real structure:
      this.formations = Array.isArray(response) ? response : response.data || response.formations || [];

      this.totalPages = Math.ceil(this.formations.length / this.pageSize);
      this.updatePagination();
    },
    error: (err) => {
      console.error('Erreur lors du chargement des formations:', err);
    }
  });
}

createFormation() {
  this._router.navigate(['/back-office/formation/create']);
}

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedFormations = this.formations.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  viewFormation(formation: Formation): void {
    this._router.navigate(['/back-office/formation', formation._id]);
  }




}
