import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import './polyfills';
import '@angular/compiler';

// Initialisation de l'application
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
