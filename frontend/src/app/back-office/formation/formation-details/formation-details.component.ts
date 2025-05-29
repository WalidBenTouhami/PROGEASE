import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormationService } from '../../../core/services/formation.service';
import { Formation } from '../../../core/models/formation.model';

@Component({
  selector: 'app-formation-details',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './formation-details.component.html',
  styleUrl: './formation-details.component.css'
})
export class FormationDetailsComponent {

    backLink: string;

    formation: Formation | null = null;
  loading = true;
  error: string | null = null;

  constructor(private router: Router,private route: ActivatedRoute, private formationService: FormationService) {
    
    if (this.router.url.includes('/back-office')) {
      this.backLink = '/back-office/formations';
    } else {
      this.backLink = '/front-office/formations';
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.formationService.getFormationById(id).subscribe({
        next: (data) => {
          this.formation = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Formation introuvable ou erreur serveur.';
          this.loading = false;
        }
      });
    }
  }

}
