import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';
import { CommonModule } from '@angular/common'; // <-- à importer !

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule], // <-- ajoute CommonModule ici
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projets: Project[] = [];
  chargement = false;
  erreur = '';

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.chargement = true;
    this.projectService.recupererProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.chargement = false;
      },
      error: (err) => {
        this.erreur = "Erreur lors du chargement des projets.";
        this.chargement = false;
      }
    });
  }
}
