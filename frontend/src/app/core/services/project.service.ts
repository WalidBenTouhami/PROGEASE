//src/app/core/services/project.service.ts

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { gql } from '@apollo/client/core';

export interface User {
  id: string;
  nom: string;
  prenom: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  deadline: string;
  repositoryUrl: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'LATE';
}

export interface Evaluation {
  id: string;
  score: number;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  progression: number;
  startDate: string;
  endDate: string;
  skills: string[];
  team: {
    id: string;
    nom: string;
    prenom: string;
  }[];
  tutor?: {
    id: string;
    nom: string;
    prenom: string;
  };
  evaluations: {
    id: string;
    score: number;
    createdAt: string;
  }[];
  averageScore: number;
  predictedPerformance: number;
}

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      title
      description
      status
      progression
      startDate
      endDate
      skills
      team {
        id
        nom
        prenom
      }
      tutor {
        id
        nom
        prenom
      }
      evaluations {
        id
        score
        createdAt
      }
      averageScore
      predictedPerformance
    }
  }
`;

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      title
      description
      status
      progression
      startDate
      endDate
      skills
      team {
        id
        nom
        prenom
      }
      tutor {
        id
        nom
        prenom
      }
      evaluations {
        id
        score
        createdAt
      }
      averageScore
      predictedPerformance
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private apollo: Apollo) {}

  getProjects(): Observable<Project[]> {
    return this.apollo.watchQuery<{ projects: Project[] }>({
      query: GET_PROJECTS
    }).valueChanges.pipe(
      map(result => result.data.projects)
    );
  }

  getProject(id: string): Observable<Project> {
    return this.apollo.watchQuery<{ project: Project }>({
      query: GET_PROJECT,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.project)
    );
  }
}
