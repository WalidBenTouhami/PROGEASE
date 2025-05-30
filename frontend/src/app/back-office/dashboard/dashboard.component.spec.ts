import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackOfficeDashboardComponent } from './dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BackOfficeDashboardComponent', () => {
  let component: BackOfficeDashboardComponent;
  let fixture: ComponentFixture<BackOfficeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatIconModule,
        MatListModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        BackOfficeDashboardComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackOfficeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
