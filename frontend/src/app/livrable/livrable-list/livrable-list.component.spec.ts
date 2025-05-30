import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LivrableListComponent } from './livrable-list.component';

describe('LivrableListComponent', () => {
  let component: LivrableListComponent;
  let fixture: ComponentFixture<LivrableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        LivrableListComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivrableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
