import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
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
