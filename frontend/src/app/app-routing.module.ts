import { Routes } from '@angular/router';
import { ApiTesterComponent } from './core/components/api-tester/api-tester.component';

export const routes: Routes = [
  {
    path: 'api-test',
    component: ApiTesterComponent
  },
  {
    path: '',
    redirectTo: 'api-test',
    pathMatch: 'full'
  }
]; 