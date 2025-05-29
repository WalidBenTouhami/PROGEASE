import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTesterService } from '../services/api-tester.service';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>Test de connexion API</h2>

      <div class="test-card">
        <h3>Test REST API</h3>
        <button (click)="testRest()" [disabled]="testingRest">Tester</button>
        <div *ngIf="restResult" class="result success">
          <pre>{{ restResult | json }}</pre>
        </div>
        <div *ngIf="restError" class="result error">
          <p>Erreur: {{ restError }}</p>
        </div>
      </div>

      <div class="test-card">
        <h3>Test GraphQL</h3>
        <button (click)="testGraphQL()" [disabled]="testingGraphQL">Tester</button>
        <div *ngIf="graphqlResult" class="result success">
          <pre>{{ graphqlResult | json }}</pre>
        </div>
        <div *ngIf="graphqlError" class="result error">
          <p>Erreur: {{ graphqlError }}</p>
        </div>
      </div>

      <div class="test-card">
        <h3>Test Service IA</h3>
        <button (click)="testAI()" [disabled]="testingAI">Tester</button>
        <div *ngIf="aiResult" class="result success">
          <pre>{{ aiResult | json }}</pre>
        </div>
        <div *ngIf="aiError" class="result error">
          <p>Erreur: {{ aiError }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }
    .test-card {
      background: var(--background-medium);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h3 {
      margin-top: 0;
      color: var(--primary-color);
    }
    button {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: var(--primary-light);
    }
    button:disabled {
      background: var(--text-secondary);
      cursor: not-allowed;
    }
    .result {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 4px;
      max-height: 300px;
      overflow: auto;
    }
    .success {
      background: #e3f2fd;
      border: 1px solid #2196F3;
    }
    .error {
      background: #ffebee;
      border: 1px solid #f44336;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
    }
  `]
})
export class ApiTestComponent {
  // REST API
  restResult: any = null;
  restError: string | null = null;
  testingRest = false;

  // GraphQL
  graphqlResult: any = null;
  graphqlError: string | null = null;
  testingGraphQL = false;

  // AI Service
  aiResult: any = null;
  aiError: string | null = null;
  testingAI = false;

  constructor(private apiTester: ApiTesterService) {}

  testRest() {
    this.testingRest = true;
    this.restResult = null;
    this.restError = null;

    this.apiTester.testRestConnection().subscribe({
      next: (result) => {
        this.restResult = result;
        this.testingRest = false;
      },
      error: (error) => {
        this.restError = error.message || "Erreur de connexion";
        this.testingRest = false;
      }
    });
  }

  testGraphQL() {
    this.testingGraphQL = true;
    this.graphqlResult = null;
    this.graphqlError = null;

    this.apiTester.testGraphQLConnection().subscribe({
      next: (result) => {
        this.graphqlResult = result.data;
        this.testingGraphQL = false;
      },
      error: (error) => {
        this.graphqlError = error.message || "Erreur de connexion";
        this.testingGraphQL = false;
      }
    });
  }

  testAI() {
    this.testingAI = true;
    this.aiResult = null;
    this.aiError = null;

    const prompt = "Resumer les avantages d'une gestion de projet academique";

    this.apiTester.testAIService(prompt).subscribe({
      next: (result) => {
        this.aiResult = result;
        this.testingAI = false;
      },
      error: (error) => {
        this.aiError = error.message || "Erreur de connexion";
        this.testingAI = false;
      }
    });
  }
}
