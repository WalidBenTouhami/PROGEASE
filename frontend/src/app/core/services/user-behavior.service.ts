import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

interface UserAction {
  type: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

interface PageView {
  url: string;
  timestamp: Date;
  duration: number;
  referrer: string;
}

interface UserSession {
  startTime: Date;
  lastActivity: Date;
  actions: UserAction[];
  pageViews: PageView[];
}

@Injectable({
  providedIn: 'root'
})
export class UserBehaviorService {
  private session: UserSession = {
    startTime: new Date(),
    lastActivity: new Date(),
    actions: [],
    pageViews: []
  };

  private sessionSubject = new BehaviorSubject<UserSession>(this.session);

  constructor(private router: Router) {
    this.initializeTracking();
  }

  private initializeTracking(): void {
    // Track page views
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });

    // Track user activity
    this.trackUserActivity();
  }

  private trackUserActivity(): void {
    const activityEvents = ['click', 'keypress', 'scroll', 'mousemove'];
    
    activityEvents.forEach(eventType => {
      window.addEventListener(eventType, () => {
        this.session.lastActivity = new Date();
        this.sessionSubject.next(this.session);
      }, { passive: true });
    });
  }

  trackPageView(url: string): void {
    const pageView: PageView = {
      url,
      timestamp: new Date(),
      duration: 0,
      referrer: document.referrer
    };

    this.session.pageViews.push(pageView);
    this.sessionSubject.next(this.session);
  }

  trackAction(type: string, details: Record<string, unknown> = {}): void {
    const action: UserAction = {
      type,
      timestamp: new Date(),
      details
    };

    this.session.actions.push(action);
    this.sessionSubject.next(this.session);
  }

  getSessionData(): Observable<UserSession> {
    return this.sessionSubject.asObservable();
  }

  getSessionDuration(): number {
    return new Date().getTime() - this.session.startTime.getTime();
  }

  getLastActivityTime(): Date {
    return this.session.lastActivity;
  }

  getPageViews(): PageView[] {
    return [...this.session.pageViews];
  }

  getActions(): UserAction[] {
    return [...this.session.actions];
  }

  getActionCount(type: string): number {
    return this.session.actions.filter(action => action.type === type).length;
  }

  resetSession(): void {
    this.session = {
      startTime: new Date(),
      lastActivity: new Date(),
      actions: [],
      pageViews: []
    };
    this.sessionSubject.next(this.session);
  }
} 