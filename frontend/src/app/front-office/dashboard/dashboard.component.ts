import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  users = [{ name: 'Jean', role: 'Administrateur' }];
  roles = ['Administrateur', 'Tuteur', 'Étudiant'];
  projectTemplates = [{ name: 'Template 1' }, { name: 'Template 2' }];
  stats = { activeProjects: 5, riskGroups: 2, avgTutorPerf: 8.5 };
  tutorPerformance = [];
  aiConfig = { teamAlgo: '', riskThreshold: 50, enableRecs: true };
  openUserForm() {}
  updateRole(user: any) {}
  editUser(user: any) {}
  deleteUser(user: any) {}
  exportUsers() {}
  importUsers() {}
  createTemplate() {}
  editTemplate(template: any) {}
  updateAICfg() {}
}
