import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projets: (Project & { _id: string })[] = []; // Garantit que _id existe et est de type string
  chargement = false;
  erreur = '';

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit() {
    this.chargerProjets();
  }

  chargerProjets() {
    this.chargement = true;
    this.projectService.recupererProjets().subscribe({
      next: (projets) => {
        // Filtre les projets sans _id et effectue un cast
        this.projets = projets.filter(p => !!p._id) as (Project & { _id: string })[];
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
    this.router.navigate(['/project', id]);
  }
}
